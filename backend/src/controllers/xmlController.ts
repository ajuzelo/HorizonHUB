import { Response, NextFunction } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middleware/authenticate';
import xml2js from 'xml2js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for XML uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'xml');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});

export const xmlUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/xml' || file.mimetype === 'application/xml' || file.originalname.endsWith('.xml')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos XML são aceitos.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ──────────────────────────────────────────────────────────────────────────────
// NF-e XML Parser helper
// ──────────────────────────────────────────────────────────────────────────────
function safeGet(obj: any, ...keys: string[]): any {
  let current = obj;
  for (const key of keys) {
    if (current == null) return null;
    if (Array.isArray(current)) current = current[0];
    current = current[key];
  }
  if (Array.isArray(current)) return current[0];
  return current ?? null;
}

function parseNFe(parsed: any): {
  numero_nf: string | null;
  chave_acesso: string | null;
  fornecedor: string | null;
  cnpj_emitente: string | null;
  data_emissao: string | null;
  valor_total: number | null;
  items: any[];
  metadata: any;
} {
  // Handle both NFe and nfeProc wrappers
  const root = parsed.nfeProc ?? parsed.NFe ?? parsed;
  const nfe = root.NFe ?? root;
  const infNFe = safeGet(nfe, 'infNFe');

  const ide = safeGet(infNFe, 'ide');
  const emit = safeGet(infNFe, 'emit');
  const total = safeGet(infNFe, 'total');
  const icmsTot = safeGet(total, 'ICMSTot');
  const dets = infNFe?.det ?? [];

  const chave = safeGet(infNFe, '$', 'Id')?.replace('NFe', '') ?? null;
  const numero_nf = safeGet(ide, 'nNF');
  const data_emissao_raw = safeGet(ide, 'dhEmi') ?? safeGet(ide, 'dEmi');
  const data_emissao = data_emissao_raw ? data_emissao_raw.split('T')[0] : null;

  const fornecedor = safeGet(emit, 'xNome') ?? safeGet(emit, 'xFant');
  const cnpj_emitente = safeGet(emit, 'CNPJ');
  const valor_total = Number(safeGet(icmsTot, 'vNF')) || null;

  // Parse items
  const itemList = Array.isArray(dets) ? dets : [dets];
  const items = itemList.filter(Boolean).map((det: any, idx: number) => {
    const prod = safeGet(det, 'prod');
    const imposto = safeGet(det, 'imposto');
    const icms = safeGet(imposto, 'ICMS');
    const pis = safeGet(imposto, 'PIS');
    const cofins = safeGet(imposto, 'COFINS');
    const ipi = safeGet(imposto, 'IPI');

    // ICMS groups (CST 00, 10, 20, 40, etc.)
    const icmsGrp = icms ? Object.values(icms)[0] as any : null;

    return {
      numero_item: idx + 1,
      descricao: safeGet(prod, 'xProd') ?? `Item ${idx + 1}`,
      codigo_produto: safeGet(prod, 'cProd'),
      codigo_barras: safeGet(prod, 'cEAN') !== 'SEM GTIN' ? safeGet(prod, 'cEAN') : null,
      cfop: safeGet(prod, 'CFOP'),
      ncm: safeGet(prod, 'NCM'),
      quantidade: Number(safeGet(prod, 'qCom')) || null,
      unidade: safeGet(prod, 'uCom'),
      valor_unitario: Number(safeGet(prod, 'vUnCom')) || null,
      valor_total: Number(safeGet(prod, 'vProd')) || null,
      origem: safeGet(icmsGrp, 'orig'),
      cst_icms: safeGet(icmsGrp, 'CST') ?? safeGet(icmsGrp, 'CSOSN'),
      cst_pis: safeGet(safeGet(pis, 'PISAliq') ?? safeGet(pis, 'PISNT') ?? safeGet(pis, 'PISOutr'), 'CST'),
      cst_cofins: safeGet(safeGet(cofins, 'COFINSAliq') ?? safeGet(cofins, 'COFINSNT') ?? safeGet(cofins, 'COFINSOutr'), 'CST'),
      cst_ipi: safeGet(safeGet(ipi, 'IPITrib') ?? safeGet(ipi, 'IPINT'), 'CST'),
      valor_icms: Number(safeGet(icmsGrp, 'vICMS')) || null,
      valor_pis: Number(safeGet(safeGet(pis, 'PISAliq'), 'vPIS')) || null,
      valor_cofins: Number(safeGet(safeGet(cofins, 'COFINSAliq'), 'vCOFINS')) || null,
      valor_ipi: Number(safeGet(safeGet(ipi, 'IPITrib'), 'vIPI')) || null,
      impostos_raw: imposto ?? null,
    };
  });

  return {
    numero_nf: String(numero_nf ?? ''),
    chave_acesso: chave,
    fornecedor,
    cnpj_emitente: cnpj_emitente ? String(cnpj_emitente).replace(/\D/g, '') : null,
    data_emissao,
    valor_total,
    items,
    metadata: {
      total_items: items.length,
      parsed_at: new Date().toISOString(),
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────────
export class XmlController {
  // POST /api/xml/upload — upload and parse NF-e XML
  upload = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      if (!req.file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
      }

      const xmlContent = fs.readFileSync(req.file.path, 'utf-8');

      // Parse XML
      let parsed: any;
      try {
        parsed = await xml2js.parseStringPromise(xmlContent, {
          explicitArray: true,
          ignoreAttrs: false,
          mergeAttrs: false,
        });
      } catch {
        return res.status(422).json({ message: 'Arquivo XML inválido ou corrompido.' });
      }

      const nfe = parseNFe(parsed);

      // Check for duplicate (same chave_acesso + user)
      if (nfe.chave_acesso) {
        const existing = await db('xml_files')
          .where({ user_id: userId, chave_acesso: nfe.chave_acesso })
          .first();
        if (existing) {
          return res.status(409).json({
            message: 'Este XML já foi importado anteriormente.',
            existing_id: existing.id,
          });
        }
      }

      // Save to database inside a transaction
      const [xmlFile] = await db.transaction(async (trx) => {
        const [file] = await trx('xml_files').insert({
          user_id: userId,
          nome_arquivo: req.file!.originalname,
          numero_nf: nfe.numero_nf,
          chave_acesso: nfe.chave_acesso,
          fornecedor: nfe.fornecedor,
          cnpj_emitente: nfe.cnpj_emitente,
          data_emissao: nfe.data_emissao,
          valor_total: nfe.valor_total,
          xml_original: xmlContent.length < 500000 ? xmlContent : null, // Store if <500KB
          processado_ia: false,
          metadata: nfe.metadata,
        }).returning('*');

        if (nfe.items.length > 0) {
          await trx('xml_items').insert(
            nfe.items.map((item) => ({ xml_id: file.id, ...item }))
          );
        }

        return [file];
      });

      // Clean up temp file
      try { fs.unlinkSync(req.file.path); } catch {}

      return res.status(201).json({
        message: 'XML importado com sucesso.',
        xml: { ...xmlFile, items_count: nfe.items.length },
      });
    } catch (err) {
      if (req.file) try { fs.unlinkSync(req.file.path); } catch {}
      next(err);
    }
  };

  // GET /api/xml — list imported XMLs with filters
  list = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { search, fornecedor, date_from, date_to, page = '1', limit = '20' } = req.query as any;
      const offset = (Number(page) - 1) * Number(limit);

      let query = db('xml_files').where({ user_id: userId });

      if (search) {
        const term = `%${search}%`;
        query = query.where((q) =>
          q.whereILike('fornecedor', term)
           .orWhereILike('numero_nf', term)
           .orWhereILike('nome_arquivo', term)
        );
      }
      if (fornecedor) query = query.where({ fornecedor });
      if (date_from) query = query.where('data_emissao', '>=', date_from);
      if (date_to) query = query.where('data_emissao', '<=', date_to);

      const [{ total }] = await query.clone().count('id as total');
      const items = await query
        .orderBy('criado_em', 'desc')
        .limit(Number(limit))
        .offset(offset)
        .select('id', 'nome_arquivo', 'numero_nf', 'chave_acesso', 'fornecedor', 'cnpj_emitente', 'data_emissao', 'valor_total', 'processado_ia', 'metadata', 'criado_em');

      return res.json({ items, total: Number(total), page: Number(page), limit: Number(limit) });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/xml/:id — XML details with items
  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const xml = await db('xml_files').where({ id, user_id: userId }).first();
      if (!xml) return res.status(404).json({ message: 'XML não encontrado.' });

      const items = await db('xml_items')
        .where({ xml_id: id })
        .orderBy('numero_item', 'asc')
        .select('*');

      return res.json({ xml: { ...xml, xml_original: undefined }, items });
    } catch (err) {
      next(err);
    }
  };

  // DELETE /api/xml/:id
  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const deleted = await db('xml_files').where({ id, user_id: userId }).delete();
      if (!deleted) return res.status(404).json({ message: 'XML não encontrado.' });

      return res.json({ message: 'XML excluído.' });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/xml/summary — dashboard summary
  summary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const [{ total }] = await db('xml_files').where({ user_id: userId }).count('id as total');

      const today = new Date().toISOString().split('T')[0];
      const [{ hoje }] = await db('xml_files')
        .where({ user_id: userId })
        .whereRaw("DATE(criado_em) = ?", [today])
        .count('id as hoje');

      return res.json({ total: Number(total), hoje: Number(hoje) });
    } catch (err) {
      next(err);
    }
  };
}
