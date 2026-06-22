import { useState, useCallback } from 'react';
import { Calculator, Calendar, Clock, Percent, Divide } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Standard Calculator ───────────────────────────────────────────────────

function StandardCalc() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [waitingNext, setWaitingNext] = useState(false);

  const BUTTONS = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  const handleBtn = (btn: string) => {
    if (btn === 'C') {
      setDisplay('0'); setExpression(''); setWaitingNext(false); return;
    }
    if (btn === '±') {
      setDisplay((d) => String(parseFloat(d) * -1)); return;
    }
    if (btn === '%') {
      setDisplay((d) => String(parseFloat(d) / 100)); return;
    }
    if (['÷', '×', '−', '+'].includes(btn)) {
      const op = btn === '÷' ? '/' : btn === '×' ? '*' : btn === '−' ? '-' : '+';
      setExpression(display + op);
      setWaitingNext(true);
      return;
    }
    if (btn === '=') {
      try {
        const result = Function(`"use strict"; return (${expression + display})`)();
        const r = parseFloat(result.toFixed(10));
        setDisplay(String(r));
        setExpression('');
        setWaitingNext(false);
      } catch { setDisplay('Erro'); }
      return;
    }
    if (btn === '.') {
      if (waitingNext) { setDisplay('0.'); setWaitingNext(false); return; }
      if (!display.includes('.')) setDisplay((d) => d + '.');
      return;
    }
    if (waitingNext) { setDisplay(btn); setWaitingNext(false); return; }
    setDisplay((d) => d === '0' ? btn : d + btn);
  };

  return (
    <div className="card p-4 max-w-xs mx-auto">
      {/* Display */}
      <div className="bg-bg-base rounded-xl p-4 mb-3 text-right">
        <p className="text-xs text-text-muted h-4">{expression}</p>
        <p className="text-3xl font-mono font-light text-text-primary mt-1 truncate">{display}</p>
      </div>
      {/* Buttons */}
      <div className="grid gap-1.5">
        {BUTTONS.map((row, ri) => (
          <div key={ri} className={cn('grid gap-1.5', row.length === 4 ? 'grid-cols-4' : 'grid-cols-4')}>
            {row.map((btn, bi) => {
              const isOp = ['÷', '×', '−', '+'].includes(btn);
              const isEq = btn === '=';
              const isFunc = ['C', '±', '%'].includes(btn);
              const isZero = btn === '0';
              return (
                <button
                  key={bi}
                  onClick={() => handleBtn(btn)}
                  className={cn(
                    'h-12 rounded-xl font-medium text-sm transition-all duration-100 active:scale-95',
                    isZero && 'col-span-2',
                    isOp  && 'bg-gold/10 text-gold border border-gold/20 hover:bg-gold/15',
                    isEq  && 'bg-gold text-gold-foreground hover:bg-gold-600 font-semibold',
                    isFunc && 'bg-bg-overlay text-text-secondary hover:bg-bg-muted',
                    !isOp && !isEq && !isFunc && 'bg-bg-elevated text-text-primary hover:bg-bg-overlay border border-white/[0.06]',
                  )}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Percentage Calculator ──────────────────────────────────────────────────

function PercentCalc() {
  const [valor, setValor] = useState('');
  const [percent, setPercent] = useState('');
  const [result, setResult] = useState<{ of: number; over: number; increase: number; decrease: number } | null>(null);

  const calculate = () => {
    const v = parseFloat(valor);
    const p = parseFloat(percent);
    if (isNaN(v) || isNaN(p)) return;
    setResult({
      of: (v * p) / 100,
      over: (p / v) * 100,
      increase: v + (v * p) / 100,
      decrease: v - (v * p) / 100,
    });
  };

  const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 4 });

  return (
    <div className="card p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="input-label">Valor</label>
          <input type="number" value={valor} onChange={(e) => setValor(e.target.value)} className="input" placeholder="0" />
        </div>
        <div>
          <label className="input-label">Porcentagem (%)</label>
          <input type="number" value={percent} onChange={(e) => setPercent(e.target.value)} className="input" placeholder="0" />
        </div>
      </div>
      <button onClick={calculate} className="btn-primary w-full">Calcular</button>
      {result && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: `${percent}% de ${valor}`, value: fmt(result.of) },
            { label: `${percent} é % de ${valor}`, value: `${fmt(result.over)}%` },
            { label: `${valor} + ${percent}%`, value: fmt(result.increase) },
            { label: `${valor} − ${percent}%`, value: fmt(result.decrease) },
          ].map((r, i) => (
            <div key={i} className="bg-bg-elevated rounded-xl p-3 border border-white/[0.07]">
              <p className="text-xs text-text-muted mb-1">{r.label}</p>
              <p className="text-lg font-bold text-gold">{r.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rule of Three ─────────────────────────────────────────────────────────

function RuleOfThree() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const na = parseFloat(a), nb = parseFloat(b), nc = parseFloat(c);
    if (isNaN(na) || isNaN(nb) || isNaN(nc) || na === 0) return;
    setResult((nb * nc) / na);
  };

  return (
    <div className="card p-5 space-y-4">
      <p className="text-xs text-text-secondary">
        Se <strong className="text-text-primary">{a || 'A'}</strong> corresponde a <strong className="text-text-primary">{b || 'B'}</strong>, então <strong className="text-text-primary">{c || 'C'}</strong> corresponde a <strong className="text-gold">X</strong>
      </p>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="input-label">A</label><input type="number" value={a} onChange={(e) => setA(e.target.value)} className="input" placeholder="0" /></div>
        <div><label className="input-label">B</label><input type="number" value={b} onChange={(e) => setB(e.target.value)} className="input" placeholder="0" /></div>
        <div><label className="input-label">C</label><input type="number" value={c} onChange={(e) => setC(e.target.value)} className="input" placeholder="0" /></div>
      </div>
      <button onClick={calculate} className="btn-primary w-full">Calcular X</button>
      {result !== null && (
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 text-center">
          <p className="text-xs text-text-muted mb-1">Resultado (X)</p>
          <p className="text-3xl font-bold text-gold">{result.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}</p>
        </div>
      )}
    </div>
  );
}

// ─── Date Calculator ───────────────────────────────────────────────────────

function HOLIDAYS_BR(): string[] {
  const y = new Date().getFullYear();
  return [
    `${y}-01-01`, `${y}-04-21`, `${y}-05-01`, `${y}-09-07`,
    `${y}-10-12`, `${y}-11-02`, `${y}-11-15`, `${y}-12-25`,
    `${y + 1}-01-01`,
  ];
}

function addBusinessDays(dateStr: string, days: number): string {
  const holidays = HOLIDAYS_BR();
  const d = new Date(dateStr + 'T00:00:00');
  let count = 0;
  while (count < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    const iso = d.toISOString().split('T')[0];
    if (dow !== 0 && dow !== 6 && !holidays.includes(iso)) count++;
  }
  return d.toISOString().split('T')[0];
}

function diffDays(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

function DateCalc() {
  const today = new Date().toISOString().split('T')[0];
  const [mode, setMode] = useState<'add' | 'diff' | 'bizdays'>('add');
  const [date1, setDate1] = useState(today);
  const [date2, setDate2] = useState(today);
  const [days, setDays] = useState('30');
  const [result, setResult] = useState<string>('');

  const calculate = () => {
    if (mode === 'add') {
      const d = parseInt(days);
      if (isNaN(d)) return;
      const r = new Date(date1 + 'T00:00:00');
      r.setDate(r.getDate() + d);
      setResult(r.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }));
    } else if (mode === 'diff') {
      const d = diffDays(date1, date2);
      setResult(`${Math.abs(d)} dia${Math.abs(d) !== 1 ? 's' : ''} ${d >= 0 ? 'de diferença' : 'no passado'}`);
    } else {
      const d = parseInt(days);
      if (isNaN(d)) return;
      const r = addBusinessDays(date1, d);
      const dt = new Date(r + 'T00:00:00');
      setResult(dt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }));
    }
  };

  return (
    <div className="card p-5 space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-bg-base rounded-xl p-1">
        {[
          { key: 'add', label: 'Somar/Subtrair' },
          { key: 'diff', label: 'Diferença' },
          { key: 'bizdays', label: 'Dias úteis' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setMode(key as any); setResult(''); }}
            className={cn(
              'flex-1 text-xs font-medium py-1.5 rounded-lg transition-all',
              mode === key ? 'bg-gold/10 text-gold border border-gold/20' : 'text-text-muted hover:text-text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'diff' ? (
        <div className="grid grid-cols-2 gap-3">
          <div><label className="input-label">Data inicial</label><input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} className="input" /></div>
          <div><label className="input-label">Data final</label><input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} className="input" /></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div><label className="input-label">Data base</label><input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} className="input" /></div>
          <div><label className="input-label">{mode === 'bizdays' ? 'Dias úteis a somar' : 'Dias (negativo = subtrair)'}</label><input type="number" value={days} onChange={(e) => setDays(e.target.value)} className="input" /></div>
        </div>
      )}

      <button onClick={calculate} className="btn-primary w-full">Calcular</button>

      {result && (
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-gold capitalize">{result}</p>
        </div>
      )}
    </div>
  );
}

// ─── Hours Calculator ──────────────────────────────────────────────────────

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatMinutes(mins: number): string {
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${mins < 0 ? '-' : ''}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function HoursCalc() {
  const [mode, setMode] = useState<'interval' | 'sum' | 'sub'>('interval');
  const [t1, setT1] = useState('08:00');
  const [t2, setT2] = useState('17:30');
  const [times, setTimes] = useState(['00:00', '00:00']);
  const [result, setResult] = useState('');

  const calculate = () => {
    if (mode === 'interval') {
      const mins = parseTime(t2) - parseTime(t1);
      setResult(formatMinutes(mins));
    } else {
      const total = times.reduce((acc, t) => {
        const m = parseTime(t);
        return mode === 'sub' ? acc - m : acc + m;
      }, 0);
      setResult(formatMinutes(total));
    }
  };

  const addTime = () => setTimes((p) => [...p, '00:00']);
  const removeTime = (i: number) => setTimes((p) => p.filter((_, idx) => idx !== i));
  const updateTime = (i: number, v: string) => setTimes((p) => p.map((t, idx) => idx === i ? v : t));

  return (
    <div className="card p-5 space-y-4">
      <div className="flex gap-1 bg-bg-base rounded-xl p-1">
        {[
          { key: 'interval', label: 'Intervalo' },
          { key: 'sum', label: 'Somar horas' },
          { key: 'sub', label: 'Subtrair horas' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setMode(key as any); setResult(''); }}
            className={cn(
              'flex-1 text-xs font-medium py-1.5 rounded-lg transition-all',
              mode === key ? 'bg-gold/10 text-gold border border-gold/20' : 'text-text-muted hover:text-text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'interval' ? (
        <div className="grid grid-cols-2 gap-3">
          <div><label className="input-label">Início</label><input type="time" value={t1} onChange={(e) => setT1(e.target.value)} className="input font-mono" /></div>
          <div><label className="input-label">Fim</label><input type="time" value={t2} onChange={(e) => setT2(e.target.value)} className="input font-mono" /></div>
        </div>
      ) : (
        <div className="space-y-2">
          {times.map((t, i) => (
            <div key={i} className="flex gap-2">
              <input type="time" value={t} onChange={(e) => updateTime(i, e.target.value)} className="input flex-1 font-mono" />
              {times.length > 2 && (
                <button onClick={() => removeTime(i)} className="btn-ghost px-2 text-danger"><span>✕</span></button>
              )}
            </div>
          ))}
          <button onClick={addTime} className="btn-secondary w-full text-xs">+ Adicionar horário</button>
        </div>
      )}

      <button onClick={calculate} className="btn-primary w-full">Calcular</button>

      {result && (
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 text-center">
          <p className="text-xs text-text-muted mb-1">Total</p>
          <p className="text-4xl font-mono font-bold text-gold">{result}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

const TABS = [
  { key: 'standard',  label: 'Calculadora', icon: Calculator },
  { key: 'percent',   label: 'Porcentagem', icon: Percent    },
  { key: 'rule3',     label: 'Regra de 3',  icon: Divide     },
  { key: 'dates',     label: 'Datas',       icon: Calendar   },
  { key: 'hours',     label: 'Horas',       icon: Clock      },
];

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState('standard');

  return (
    <div className="animate-fade-in max-w-xl mx-auto">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Calculator size={20} className="text-gold" /> Calculadora
        </h1>
        <p className="page-subtitle">Cálculos essenciais do dia a dia</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-bg-surface border border-white/[0.06] rounded-xl p-1 mb-5 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0',
              activeTab === key
                ? 'bg-gold/10 text-gold border border-gold/20'
                : 'text-text-muted hover:text-text-primary'
            )}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'standard' && <StandardCalc />}
      {activeTab === 'percent' && <PercentCalc />}
      {activeTab === 'rule3' && <RuleOfThree />}
      {activeTab === 'dates' && <DateCalc />}
      {activeTab === 'hours' && <HoursCalc />}
    </div>
  );
}
