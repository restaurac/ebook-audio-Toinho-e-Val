import React, { useState, useRef, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Book, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  BookOpen, 
  Compass, 
  Award, 
  HelpCircle, 
  Mail, 
  RotateCcw, 
  Check, 
  Sparkles, 
  BarChart,
  Home,
  ShieldAlert,
  Sliders,
  CheckCircle,
  Menu,
  X,
  Printer,
  ExternalLink,
  Download,
  ArrowLeft
} from "lucide-react";
import { bookPages, catalogCardData } from "./data";
import { BookPage } from "./types";

export default function App() {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isPrintMode, setIsPrintMode] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<"dark" | "paper">("dark");
  const [narrationSpeed, setNarrationSpeed] = useState<number>(1);
  
  // Audio playback state
  const [audioState, setAudioState] = useState<{
    isLoading: boolean;
    isPlaying: boolean;
    error: string | null;
    activePageId: number | null;
    isFallback?: boolean;
  }>({
    isLoading: false,
    isPlaying: false,
    error: null,
    activePageId: null,
    isFallback: false
  });

  // Quiz state for high-conversion engagement
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Email Lead state for subsequent volumes
  const [emailLead, setEmailLead] = useState<string>("");
  const [leadSubmitted, setLeadSubmitted] = useState<boolean>(false);

  // Audio web API references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioGainNodeRef = useRef<GainNode | null>(null);

  const currentPage = bookPages[currentPageIndex];

  // Clean up audio on page unmount or change
  useEffect(() => {
    stopNarration();
    return () => {
      stopNarration();
    };
  }, [currentPageIndex]);

  const stopNarration = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Source might have already stopped
      }
      audioSourceRef.current = null;
    }
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setAudioState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
  };

  const playNarration = async (page: BookPage) => {
    stopNarration();
    setAudioState({ isLoading: true, isPlaying: false, error: null, activePageId: page.id, isFallback: false });

    // Build the text to speak
    let textToRead = `${page.title}. ${page.subtitle || ""}. `;
    if (page.paragraphs && page.paragraphs.length > 0) {
      textToRead += page.paragraphs.join(" ... ");
    }
    if (page.quote) {
      textToRead += ` ... Citação: ... ${page.quote} ... por ${page.quoteAuthor || "autor anônimo"}`;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = audioCtxRef.current || new AudioContextClass({ sampleRate: 24000 });
      audioCtxRef.current = audioCtx;

      let audioBuffer: AudioBuffer | null = null;

      if (!page.audio) {
        throw new Error("404");
      }

      const fileResponse = await fetch(page.audio);
      if (!fileResponse.ok) {
        throw new Error("404");
      }

      const contentType = fileResponse.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error("404");
      }

      const arrayBuffer = await fileResponse.arrayBuffer();
      try {
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      } catch (decodeErr) {
        throw new Error("404");
      }

      if (audioBuffer) {
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 1.0;
        audioGainNodeRef.current = gainNode;

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = narrationSpeed;
        source.connect(gainNode);
        mainOutputRoute(audioCtx, gainNode);

        source.onended = () => {
          setAudioState(prev => {
            if (prev.activePageId === page.id) {
              return { ...prev, isPlaying: false };
            }
            return prev;
          });
        };

        source.start(0);
        audioSourceRef.current = source;
        setAudioState({ isLoading: false, isPlaying: true, error: null, activePageId: page.id, isFallback: false });
      }
    } catch (err: any) {
      console.warn(`[Narração] Áudio premium não encontrado ou falhou ao carregar para página ${page.id}. Ativando fallback de voz local...`);
      
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
          
          const cleanText = textToRead.replace(/\.\.\./g, ".");
          const utterance = new SpeechSynthesisUtterance(cleanText);
          
          const voices = window.speechSynthesis.getVoices();
          // Prioriza vozes em pt-BR agradáveis
          const ptVoice = voices.find(v => v.lang.includes("pt-BR") || v.lang.includes("pt")) || null;
          if (ptVoice) {
            utterance.voice = ptVoice;
          }
          utterance.lang = "pt-BR";
          utterance.rate = narrationSpeed;
          
          utterance.onstart = () => {
            setAudioState({ isLoading: false, isPlaying: true, error: null, activePageId: page.id, isFallback: true });
          };
          
          utterance.onend = () => {
            setAudioState(prev => {
              if (prev.activePageId === page.id) {
                return { ...prev, isPlaying: false };
              }
              return prev;
            });
          };
          
          utterance.onerror = (e) => {
            console.error("Erro na síntese de voz local:", e);
            setAudioState({
              isLoading: false,
              isPlaying: false,
              error: "Não foi possível reproduzir a narração desta página.",
              activePageId: page.id,
              isFallback: false
            });
          };
          
          window.speechSynthesis.speak(utterance);
        } catch (speechErr) {
          console.error("Erro ao iniciar síntese de voz:", speechErr);
          setAudioState({
            isLoading: false,
            isPlaying: false,
            error: "Narração de fallback falhou.",
            activePageId: page.id,
            isFallback: false
          });
        }
      } else {
        setAudioState({
          isLoading: false,
          isPlaying: false,
          error: "Áudio indisponível neste navegador.",
          activePageId: page.id,
          isFallback: false
        });
      }
    }
  };

  const mainOutputRoute = (ctx: AudioContext, node: AudioNode) => {
    node.connect(ctx.destination);
  };

  const handleVoiceToggle = () => {
    stopNarration();
  };

  // Adjust playback speed of active source
  useEffect(() => {
    if (audioSourceRef.current && audioState.isPlaying) {
      try {
        audioSourceRef.current.playbackRate.value = narrationSpeed;
      } catch (e) {}
    }
  }, [narrationSpeed, audioState.isPlaying]);

  const handleNextPage = () => {
    if (currentPageIndex < bookPages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const handlePageSelect = (index: number) => {
    setCurrentPageIndex(index);
    setSidebarOpen(false);
  };

  // Quiz questions definition
  const quizQuestions = [
    {
      id: 1,
      q: "Na lição da floresta, quem conseguiu ficar de pé e resistir ao vendaval da tempestade?",
      options: [
        { label: "O imponente Carvalho, pois ele era duro e inquebrável", value: "A" },
        { label: "O Bambu Flexível, curvando-se humildemente para deixar o vento passar", value: "B" },
        { label: "A rocha, pois resistiu quebrando as árvores", value: "C" }
      ],
      correct: "B"
    },
    {
      id: 2,
      q: "O que a sábia mãe de Toinho revelou ser o verdadeiro tesouro escondido no poço antigo?",
      options: [
        { label: "Um baú antigo carregado de moedas de ouro e joias preciosas", value: "A" },
        { label: "Água pura e límpida, saúde, a luz do sol e o amor das pessoas ao redor", value: "B" },
        { label: "Um mapa em pergaminho sagrado que levava a outro reino", value: "C" }
      ],
      correct: "B"
    },
    {
      id: 3,
      q: "Por que Toinho aprendeu que ir à escola no horário certo é fundamental?",
      options: [
        { label: "Para não comer as frutas secas do atraso, aproveitando o saber quando ele está maduro", value: "A" },
        { label: "Para poder pescar e brincar com mais moedas de ouro", value: "B" },
        { label: "Para fugir de castigos impostos pela chuva e pelo frio", value: "C" }
      ],
      correct: "A"
    }
  ];

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let score = 0;
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correct) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleQuizReset = () => {
    setQuizAnswers({});
    setQuizScore(null);
    setQuizSubmitted(false);
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailLead.trim() && emailLead.includes("@")) {
      setLeadSubmitted(true);
    }
  };

  const renderFichaCatalografica = () => {
    return (
      <div className="border border-dashed border-yellow-700/60 rounded-lg p-5 bg-yellow-950/20 max-w-lg mx-auto font-sans leading-relaxed text-xs shadow-inner">
        <div className="text-center font-bold font-serif border-b border-yellow-700/30 pb-2 mb-3 tracking-wide text-yellow-500 text-sm">
          Ficha Catalográfica de Publicação (CIP)
          <p className="text-[10px] font-mono font-normal uppercase text-yellow-600/70 mt-1">
            Impedimento de Reprodução Não-Autorizada (Lei 9.610/98)
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-yellow-200/90 py-2">
          <div className="md:col-span-12 font-mono border-b border-yellow-700/10 pb-1 flex justify-between">
            <span>Código de Controle: <b>{catalogCardData.isbn}</b></span>
            <span>CRB: {catalogCardData.cataloguerCode}</span>
          </div>

          <div className="md:col-span-3 text-yellow-500 font-mono text-[10px] uppercase">Autor principal:</div>
          <div className="md:col-span-9 font-serif font-semibold">{catalogCardData.author}</div>

          <div className="md:col-span-3 text-yellow-500 font-mono text-[10px] uppercase">Obra & Título:</div>
          <div className="md:col-span-9 font-serif">{catalogCardData.title} : {catalogCardData.subtitle} / Anderson Silva. -- {catalogCardData.place} , {catalogCardData.year}.</div>

          <div className="md:col-span-3 text-yellow-500 font-mono text-[10px] uppercase">Extensão:</div>
          <div className="md:col-span-9 font-mono">{catalogCardData.pagesCount} páginas - Formato Eletrônico Interativo Profissional.</div>

          <div className="md:col-span-3 text-yellow-500 font-mono text-[10px] uppercase">Assuntos / Tags:</div>
          <div className="md:col-span-9 flex flex-col gap-1 text-[11px]">
            {catalogCardData.keywords.map((kw, i) => (
              <span key={i} className="text-yellow-100">{kw}</span>
            ))}
          </div>

          <div className="md:col-span-12 flex justify-between border-t border-yellow-700/10 pt-3 mt-2 font-mono text-[10px] text-yellow-600/70">
            <span>CDD: {catalogCardData.cdd}</span>
            <span>Criação: 15/12/2025</span>
            <span>CDU: {catalogCardData.cdu}</span>
          </div>
        </div>

        {/* Fictional Barcode mimicking physical volume protection */}
        <div className="mt-4 pt-3 border-t border-yellow-700/20 text-center flex flex-col items-center justify-center bg-black/30 p-2 rounded">
          <div className="flex gap-[2px] h-10 items-stretch bg-transparent py-1">
            {[1,3,1,1,4,2,1,3,1,2,4,1,2,1,3,4,1,1,3,2,1,1,4,1,2,1,3,1,1].map((width, idx) => (
              <div 
                key={idx} 
                className="bg-yellow-500/80" 
                style={{ width: `${width}px` }}
              />
            ))}
          </div>
          <div className="text-[9px] font-mono tracking-widest text-[#d4af37] mt-1">
            *REG-BR-2026-TF82-VIP*
          </div>
        </div>
      </div>
    );
  };

  const getPageHeaderBg = () => {
    return theme === "dark" 
      ? "from-neutral-900 via-neutral-950 to-black text-white" 
      : "from-stone-50 via-amber-50/20 to-stone-100 text-stone-900";
  };

  const getBookSheetBg = () => {
    return theme === "dark"
      ? "bg-neutral-900 border border-neutral-800 shadow-yellow-950/10 text-neutral-100"
      : "bg-[#fcfaf5] border border-stone-200/80 shadow-stone-300 text-stone-900";
  };

  if (isPrintMode) {
    return (
      <div className="min-h-screen bg-slate-100 text-stone-900 font-sans p-4 md:p-8 selection:bg-yellow-100">
        {/* CONTROL HEADERS / INSTRUCTIONS BLOCK (Ocultado quando impresso) */}
        <div className="no-print max-w-4xl mx-auto mb-10 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-yellow-500/30 p-6 rounded-2xl shadow-md text-stone-800 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-500 text-neutral-950 rounded-xl">
              <Printer size={28} />
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-lg font-bold text-stone-900 font-serif">Modo de Exportação e Impressão para PDF Comercial (Hotmart / Sites / Funis)</h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Preparamos um layout limpo de altíssima definição, no formato padrão de livro digital comercial, contendo todas as 19 páginas organizadas sequencialmente com as suas lindas ilustrações, fichas de registro de propriedade intelectual e créditos de venda ativa para o autor <strong>Anderson Silva</strong>.
              </p>
            </div>
          </div>

          <div className="border-t border-yellow-500/20 pt-4 space-y-2">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl my-2 text-stone-800">
              <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                ⚠️ ALERTA IMPORTANTE PARA DOWNLOAD:
              </h4>
              <p className="text-xs text-stone-700 leading-relaxed">
                Como você está usando o pré-visualizador integrado do Google AI Studio (que exibe a barra cinza superior com as opções <strong>"Remix"</strong>, <strong>"Device"</strong>), o seu navegador celular limita a impressão a apenas <strong>1 página</strong> (pois ele enxerga apenas o contorno da tela do editor).
              </p>
              <p className="text-xs text-stone-700 font-bold mt-1.5">
                Para baixar todas as 19 páginas completas com sucesso, clique botão abaixo para abrir o e-book em uma nova aba limpa do seu navegador, e em seguida clique no botão amarelo de "Imprimir / Salvar como PDF"!
              </p>
              
              <div className="mt-3">
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-red-650 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-sm"
                >
                  <ExternalLink size={14} /> Abrir em Nova Aba para Salvar Completo 🚀
                </a>
              </div>
            </div>

            <h3 className="text-xs uppercase font-bold text-yellow-800 font-mono tracking-wider">Passo a Passo para Gerar e Baixar seu PDF de Vendas:</h3>
            <ul className="text-xs text-stone-700 list-decimal pl-5 space-y-1.5 leading-relaxed">
              <li>Clique no botão <strong>"Imprimir / Salvar como PDF"</strong> abaixo para abrir as configurações do sistema de impressão do seu navegador.</li>
              <li>No campo <strong>Destino (Printer)</strong>, selecione a opção <strong>"Salvar como PDF"</strong> (ou "Save as PDF").</li>
              <li>Clique em <strong>Mais definições / Opções</strong> e marque a caixa de seleção <strong>"Gráficos de segundo plano" (Background graphics)</strong>. Isso é absolutamente indispensável para carregar as fotos de capa, ilustrações secundárias, cores de destaques e bordas!</li>
              <li>Certifique-se de que o tamanho do papel esteja configurado como <strong>A4</strong> ou <strong>Carta</strong>, e o layout como <strong>Retrato (Portrait)</strong>.</li>
              <li>Defina as Margens como <strong>Nenhuma</strong> (ou "Padrão") para obter o melhor encaixe e quebras de página automáticas perfeitas de 1 em 1 folha!</li>
              <li>Salve o arquivo no seu computador! Seu e-book oficial estará 100% pronto para upload e faturamento imediato na <strong>Hotmart</strong> ou funil de vendas PWA!</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => window.print()}
              className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-neutral-950 hover:brightness-105 font-bold px-6 py-2.5 rounded-full text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Printer size={15} /> Imprimir / Salvar como PDF
            </button>
            <button
              onClick={() => setIsPrintMode(false)}
              className="bg-stone-250 hover:bg-stone-300 text-stone-800 font-bold px-5 py-2.5 rounded-full text-xs transition-all flex items-center gap-1.5"
            >
              <ArrowLeft size={15} /> Voltar para o E-book Interativo
            </button>
          </div>
        </div>

        {/* CONTAINER QUE DETÉM TODAS AS PÁGINAS DO LIVRO DIGITAL PARA O PDF */}
        <div className="max-w-[800px] mx-auto space-y-8 print:space-y-0 bg-transparent">
          {bookPages.map((page, index) => {
            return (
              <div 
                key={page.id} 
                className="print-page-break bg-white text-[#1c1917] p-8 md:p-14 border border-stone-200 min-h-[1050px] flex flex-col justify-between relative shadow-[0_4px_12px_rgba(0,0,0,0.03)] print:shadow-none print:border-none"
              >
                {/* Cabeçalho da página para o PDF */}
                <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-2 mb-6">
                  <span>{page.chapter || "VOLUME I"}</span>
                  <span>{page.title.toUpperCase()}</span>
                </div>

                {/* Conteúdo Dinâmico por Tipo de Página */}
                <div className="flex-1 flex flex-col justify-center py-4">
                  {page.type === "cover" && (
                    <div className="text-center space-y-6 max-w-xl mx-auto">
                      <div className="mx-auto w-40 h-1 bg-yellow-500 rounded-full" />
                      <p className="text-xs uppercase font-mono tracking-widest text-[#d4af37] font-semibold">Volume I • Lançamento Histórico</p>
                      
                      <h1 className="font-serif text-4xl md:text-5xl tracking-tight text-stone-900 leading-tight font-black">
                        {page.title}
                      </h1>
                      <h2 className="font-serif text-xl md:text-2xl text-yellow-700 font-medium italic mt-2">
                        {page.subtitle}
                      </h2>

                      {page.image && (
                        <div className="my-8 max-w-[280px] mx-auto border-4 border-yellow-500 rounded-xl overflow-hidden shadow-md">
                          <img 
                            src={page.image} 
                            alt={page.imageAlt} 
                            referrerPolicy="no-referrer"
                            className="w-full aspect-[3/4] object-cover"
                          />
                        </div>
                      )}

                      <div className="space-y-3 text-xs md:text-sm text-stone-600 max-w-md mx-auto pt-4 leading-relaxed">
                        {page.paragraphs.map((p, idx) => (
                          <p key={idx}>{p}</p>
                        ))}
                      </div>

                      <div className="pt-8 text-xs font-mono text-stone-400 border-t border-stone-100 max-w-xs mx-auto">
                        <p className="font-bold text-stone-600">Autor: Anderson Silva</p>
                        <p className="mt-1">Publicação e Lançamento Digital • 2026</p>
                      </div>
                    </div>
                  )}

                  {page.type === "copyright" && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                      <div className="text-center">
                        <ShieldAlert className="text-yellow-600 mx-auto mb-3 animate-none" size={32} />
                        <h2 className="font-serif text-2xl font-bold text-stone-900">{page.title}</h2>
                        <p className="text-[10px] text-stone-400 mt-1 uppercase font-mono">{page.subtitle}</p>
                      </div>

                      <div className="space-y-3.5 text-xs text-stone-600 leading-relaxed max-w-lg mx-auto py-2">
                        {page.paragraphs.map((p, idx) => {
                          if (p.includes("PROIBIDA") || p.includes("ESTRITAMENTE") || p.includes("CÓDIGO DE CONTROLE")) {
                            return (
                              <div key={idx} className="print-border-yellow border-l-4 border-yellow-600 bg-stone-50 p-3 rounded font-medium text-stone-800 my-2">
                                {p}
                              </div>
                            );
                          }
                          return <p key={idx} className="indent-4 text-justify">{p}</p>;
                        })}
                      </div>

                      {/* CIP Ficha catalografica block */}
                      <div className="pt-4">
                        {renderFichaCatalografica()}
                      </div>
                    </div>
                  )}

                  {(page.type === "dedication" || page.type === "preface") && (
                    <div className="max-w-2xl mx-auto space-y-6">
                      <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-stone-900 text-center">
                        {page.title}
                      </h2>
                      {page.subtitle && (
                        <p className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase text-center font-bold">
                          {page.subtitle}
                        </p>
                      )}

                      {page.image && (
                        <div className="max-w-[280px] mx-auto border border-stone-200 rounded-lg overflow-hidden my-4 shadow-sm">
                          <img 
                            src={page.image} 
                            alt={page.imageAlt} 
                            referrerPolicy="no-referrer"
                            className="w-full object-cover aspect-[4/3]" 
                          />
                        </div>
                      )}

                      <div className="space-y-4 text-xs md:text-sm text-stone-700 leading-relaxed italic text-justify max-w-lg mx-auto">
                        {page.paragraphs.map((p, idx) => (
                          <p key={idx} className="indent-4">{p}</p>
                        ))}
                      </div>

                      {page.quote && (
                        <div className="border-y border-stone-150 py-4 my-6 text-center max-w-md mx-auto">
                          <p className="font-serif italic text-sm text-stone-800">
                            "{page.quote}"
                          </p>
                          <p className="text-[9px] font-mono uppercase tracking-widest text-stone-400 mt-2">
                            — {page.quoteAuthor}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {page.type === "content" && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                      <div className="text-center space-y-1">
                        <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-stone-900 leading-tight">
                          {page.title}
                        </h2>
                        {page.subtitle && (
                          <p className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
                            {page.subtitle}
                          </p>
                        )}
                      </div>

                      {page.image && (
                        <div className="max-w-[320px] mx-auto border border-stone-200 rounded-xl overflow-hidden shadow-md my-4">
                          <img 
                            src={page.image} 
                            alt={page.imageAlt} 
                            referrerPolicy="no-referrer"
                            className="w-full aspect-[4/3] object-cover" 
                          />
                        </div>
                      )}

                      <div className="space-y-4 text-xs md:text-sm text-stone-800 leading-relaxed text-justify max-w-xl mx-auto">
                        {page.paragraphs.map((para, pIdx) => {
                          if (pIdx === 0 && para.length > 5) {
                            const firstChar = para.charAt(0);
                            const remainingText = para.slice(1);
                            return (
                              <p key={pIdx} className="indent-0">
                                <span className="float-left text-3xl font-serif font-extrabold text-[#d4af37] mr-1.5 mt-0.5 leading-none bg-stone-50 px-1.5 rounded border border-stone-200">
                                  {firstChar}
                                </span>
                                {remainingText}
                              </p>
                            );
                          }
                          return (
                            <p key={pIdx} className="indent-6">
                              {para}
                            </p>
                          );
                        })}
                      </div>

                      {page.quote && (
                        <div className="border-l-4 border-yellow-500 pl-4 py-1.5 my-4 bg-stone-50 text-xs italic max-w-xl mx-auto">
                          <p className="text-stone-800">"{page.quote}"</p>
                          <p className="text-[9px] font-mono uppercase text-stone-400 mt-1">— {page.quoteAuthor}</p>
                        </div>
                      )}

                      {page.highlights && page.highlights.length > 0 && (
                        <div className="mt-5 space-y-2 max-w-xl mx-auto">
                          {page.highlights.map((highlight, hIdx) => {
                            const parts = highlight.split(":");
                            if (parts.length > 1) {
                              return (
                                <div key={hIdx} className="bg-stone-50 border border-stone-200 p-3 rounded-lg text-xs leading-relaxed">
                                  <span className="font-bold text-yellow-800">{parts[0]}: </span>
                                  <span className="text-stone-700">{parts.slice(1).join(":")}</span>
                                </div>
                              );
                            }
                            return (
                              <div key={hIdx} className="bg-stone-50 border border-stone-200 p-3 rounded-lg text-xs text-stone-700">
                                <span>{highlight}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {page.steps && page.steps.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-stone-150 max-w-xl mx-auto">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold block mb-3">
                            Passos da Lição:
                          </span>
                          <div className="grid grid-cols-2 gap-3">
                            {page.steps.map((step, sIdx) => (
                              <div key={sIdx} className="p-3 rounded-lg border border-stone-200 bg-stone-50">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-serif font-bold text-xs text-stone-950">{step.title}</span>
                                  <span className="font-mono text-[9px] bg-yellow-500/15 text-yellow-850 px-1.5 py-0.2 rounded-full font-bold">
                                    {step.number}
                                  </span>
                                </div>
                                <p className="text-[10px] text-stone-500 mt-0.5 leading-relaxed">{step.desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {page.type === "summary" && (
                    <div className="space-y-6 max-w-2xl mx-auto">
                      <div className="text-center space-y-1">
                        <Award className="text-yellow-600 mx-auto" size={32} />
                        <h2 className="font-serif text-2xl font-black text-stone-900">
                          {page.title}
                        </h2>
                        <p className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase">{page.subtitle}</p>
                        <p className="text-xs text-stone-550 max-w-md mx-auto">{page.paragraphs[0]}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-3.5 mt-4">
                        {page.superpowers?.map((sp, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="font-mono text-[9px] uppercase font-bold text-yellow-700">Superpoder #{sp.num}</span>
                              </div>
                              <h3 className="font-serif font-bold text-xs text-stone-900 mb-0.5">{sp.title}</h3>
                              <p className="text-[10px] text-stone-500 leading-normal">{sp.desc}</p>
                            </div>
                            <div className="mt-2 text-[9px] font-mono text-yellow-750 font-semibold bg-yellow-100/30 p-1 rounded-lg border border-yellow-200/20 text-center flex items-center justify-center gap-1">
                              <CheckCircle size={10} /> Ativo no Caráter
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-stone-150 pt-5 text-center text-xs text-stone-500">
                        <p className="font-serif italic font-medium">"O verdadeiro saber é o amor que compartilhamos a cada jornada."</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rodapé da página para o PDF */}
                <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 pt-3 border-t border-stone-150 mt-6">
                  <span>© 2026 Anderson Silva VIP</span>
                  <span>PÁGINA {index + 1} DE {bookPages.length}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div id="ebook_app" className={`min-h-screen relative flex flex-col transition-colors duration-500 ${theme === "dark" ? "bg-neutral-950 text-white" : "bg-[#f5f2eb] text-stone-900"} font-sans`}>
      
      {/* HEADER BAR */}
      <header className={`sticky top-0 z-50 px-4 md:px-6 py-3 flex items-center justify-between border-b ${theme === "dark" ? "bg-neutral-900/90 border-neutral-800" : "bg-[#f6f3eb]/95 border-stone-200"} backdrop-blur-md shadow-sm`}>
        <div className="flex items-center gap-3">
          <button 
            id="toggle_sidebar"
            onClick={() => setSidebarOpen(prev => !prev)}
            className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-neutral-800 text-yellow-500" : "hover:bg-stone-200 text-yellow-700"}`}
            title="Sumário do E-book"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-2">
            <Book className="text-[#d4af37]" size={22} />
            <div className="leading-none">
              <h1 className="font-serif text-sm md:text-base font-bold tracking-tight text-[#d4af37] truncate max-w-[200px] md:max-w-[400px]">
                Toinho e Val
              </h1>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Vol.1 Lançamento</p>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* TTS SETTING DROPDOWN */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <Sliders size={14} className="text-yellow-600" />
            <span className={theme === "dark" ? "text-neutral-400" : "text-stone-600"}>Voz Natural (Kore):</span>
            <select
              id="speed_select"
              value={narrationSpeed}
              onChange={e => setNarrationSpeed(parseFloat(e.target.value))}
              className={`rounded px-1.5 py-1 text-xs border ${theme === "dark" ? "bg-neutral-800 border-neutral-700 text-yellow-400" : "bg-stone-100 border-stone-300 text-yellow-800"}`}
            >
              <option value="0.8">0.8x Lento</option>
              <option value="1">1.0x Normal</option>
              <option value="1.2">1.2x Rápido</option>
            </select>
          </div>

          <button
            id="tts_narration_btn"
            onClick={() => {
              if (audioState.isPlaying) {
                stopNarration();
              } else {
                playNarration(currentPage);
              }
            }}
            disabled={audioState.isLoading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              audioState.isPlaying
                ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                : "bg-gradient-to-r from-yellow-500 to-amber-600 text-neutral-950 hover:brightness-110 shadow-md"
            }`}
          >
            {audioState.isLoading ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-neutral-950 animate-ping"></span>
                Carregando...
              </span>
            ) : audioState.isPlaying ? (
              <>
                <Pause size={14} /> Pare Narração
              </>
            ) : (
              <>
                <Volume2 size={14} /> Ouvir Capítulo (TTS)
              </>
            )}
          </button>
          
          {/* PDF EXPORT BUTTON */}
          <button
            id="pdf_export_btn"
            onClick={() => setIsPrintMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-md ${
              theme === "dark" 
                ? "bg-neutral-950 text-yellow-500 border border-yellow-500/30 hover:bg-neutral-900" 
                : "bg-white text-yellow-800 border border-stone-300 hover:bg-stone-50"
            }`}
            title="Baixar Livro como PDF"
          >
            <Printer size={14} />
            <span>Baixar PDF</span>
          </button>

          {/* THEME TOGGLE */}
          <button
            id="theme_toggle"
            onClick={() => setTheme(prev => prev === "dark" ? "paper" : "dark")}
            className={`p-2 rounded-full border transition-all text-sm ${theme === "dark" ? "bg-neutral-800 border-neutral-700 text-yellow-400 hover:bg-neutral-700" : "bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200"}`}
            title="Mudar paleta visual"
          >
            {theme === "dark" ? "☀️ Dia" : "🌙 Noite"}
          </button>
        </div>
      </header>

      {/* AUDIO STATE NOTIFICATION BAR */}
      {audioState.isPlaying && (
        <div className="bg-yellow-500 text-neutral-950 text-xs px-4 py-1.5 flex items-center justify-between font-medium">
          <div className="flex items-center gap-2 truncate">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span>{audioState.isFallback ? "Narração Assistida (Local):" : "Narração de Cinema Premium (Voz Kore):"} <b>{currentPage.title}</b> ({narrationSpeed}x)</span>
          </div>
          <div className="flex gap-1.5">
            {[1,2,3,4,5,6].map((bar) => (
              <div 
                key={bar} 
                className="w-1 bg-neutral-950 rounded" 
                style={{ 
                  height: `${Math.floor(Math.random() * 12) + 4}px`,
                  animation: `bounce 0.8s ease-in-out infinite alternate`,
                  animationDelay: `${bar * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {audioState.error && (
        <div className="bg-red-500/10 border-b border-red-500/30 text-red-400 text-xs px-4 py-2 text-center">
          ⚠️ {audioState.error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR FOR NAVIGATING CHAPTERS */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              id="chapters_sidebar"
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`absolute md:relative z-40 w-72 h-full flex flex-col border-r shadow-xl ${theme === "dark" ? "bg-neutral-900 border-neutral-800 text-white" : "bg-[#f9f7f0] border-stone-200 text-stone-900"}`}
            >
              <div className="p-4 border-b border-yellow-700/20 flex items-center justify-between bg-yellow-950/10">
                <span className="font-serif font-black text-yellow-500 tracking-wide">Sumário Interativo</span>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded hover:bg-neutral-800 text-xs uppercase font-mono text-yellow-600"
                >
                  Fechar
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {bookPages.map((page, idx) => {
                  const isActive = idx === currentPageIndex;
                  return (
                    <button
                      key={page.id}
                      onClick={() => handlePageSelect(idx)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-2.5 transition-all text-xs font-medium ${
                        isActive 
                          ? "bg-gradient-to-r from-yellow-600/30 to-amber-600/15 border-l-4 border-yellow-500 text-yellow-400 shadow-sm"
                          : theme === "dark" ? "hover:bg-neutral-800/60 text-neutral-400 hover:text-white" : "hover:bg-stone-200 text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <span className="font-mono text-[9px] mt-0.5 px-1 py-0.5 rounded bg-black/40 text-yellow-600">
                        Pág {page.id}
                      </span>
                      <div className="truncate flex-1">
                        <div className="font-semibold text-[10px] uppercase text-yellow-500 font-mono tracking-wider">{page.chapter}</div>
                        <div className="truncate">{page.title}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* PDF & Sale Launch Actions */}
              <div className="p-3 border-t border-yellow-700/20 bg-yellow-950/20 space-y-2">
                <button
                  onClick={() => setIsPrintMode(true)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-[#d4af37] text-neutral-950 font-bold py-2 px-3 rounded-lg text-[11px] uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all"
                >
                  <Printer size={13} /> Gerar Ebook PDF 📑
                </button>
                <div className="text-[10px] text-center text-yellow-500/90 font-medium">
                  Pronto para Vender na Hotmart
                </div>
              </div>

              {/* Legal Note in Sidebar bottom */}
              <div className="p-4 border-t border-yellow-700/10 bg-black/40 text-[9px] font-mono leading-relaxed text-yellow-600/80">
                <p>E-book Seguro contra Cópia</p>
                <p className="mt-0.5">Anderson Silva VIP</p>
                <p className="mt-1">Lei 9.610/98 • Patente-D72</p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* MAIN DISPLAY CANVAS */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col justify-between max-w-5xl mx-auto w-full relative">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPageIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={`w-full rounded-2xl p-6 md:p-12 transition-colors duration-300 shadow-xl ${getBookSheetBg()}`}
            >
              {/* PAGE METADATA */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-yellow-700/10">
                <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-[#d4af37] font-semibold">
                  {currentPage.chapter}
                </span>
                <span className="text-[10px] md:text-xs font-mono text-neutral-500">
                  PÁGINA {currentPage.id} DE {bookPages.length}
                </span>
              </div>

              {/* COVER PAGE TYPE */}
              {currentPage.type === "cover" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[480px]">
                  
                  {/* Visual 3D Book Representation */}
                  <div className="md:col-span-5 flex justify-center">
                    <div className="relative group perspective-1000">
                      <div className="absolute -inset-1.5 bg-gradient-to-r from-yellow-600 via-[#d4af37] to-amber-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                      <div className="relative bg-neutral-950 border-4 border-[#d4af37] rounded-xl overflow-hidden shadow-2xl max-w-[280px] md:max-w-[320px] transform hover:scale-105 transition-all duration-300">
                        {currentPage.image ? (
                          <img 
                            src={currentPage.image} 
                            alt={currentPage.imageAlt}
                            referrerPolicy="no-referrer"
                            className="w-full aspect-[3/4] object-cover"
                          />
                        ) : (
                          <div className="w-full aspect-[3/4] bg-neutral-900 border-collapse"></div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-neutral-950/90 p-3 text-center border-t border-yellow-900/40">
                          <span className="font-serif font-black text-xs text-yellow-500">CONHECIMENTO É AVENTURA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-6">
                    <div className="inline-block bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase">
                      E-book Premium Interativo
                    </div>
                    
                    <h2 className="font-serif text-3xl md:text-5xl font-black text-[#d4af37] leading-tight">
                      {currentPage.title}
                    </h2>
                    
                    <p className="font-serif text-lg md:text-2xl text-yellow-200/90 tracking-wide italic font-medium leading-relaxed">
                      {currentPage.subtitle}
                    </p>

                    <div className="space-y-3 pt-2 text-sm md:text-base opacity-90">
                      {currentPage.paragraphs.map((p, idx) => (
                        <p key={idx} className="leading-relaxed">{p}</p>
                      ))}
                    </div>

                    <div className="pt-6 flex flex-wrap gap-4 items-center">
                      <button
                        id="start_reading_btn"
                        onClick={handleNextPage}
                        className="bg-gradient-to-r from-[#d4af37] to-yellow-500 hover:brightness-110 text-neutral-950 font-bold px-6 py-3 rounded-full text-sm shadow-lg shadow-yellow-900/20 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                      >
                        <BookOpen size={18} /> Iniciar Leitura do Ebook
                      </button>

                      <button
                        id="cover_tts_narrate_btn"
                        onClick={() => playNarration(currentPage)}
                        className={`border ${theme === "dark" ? "border-neutral-700 bg-neutral-900/60 text-yellow-500 hover:bg-neutral-800" : "border-stone-300 bg-stone-100 text-yellow-800 hover:bg-stone-200"} rounded-full px-5 py-3 text-sm flex items-center gap-2`}
                      >
                        <Volume2 size={16} /> Ouvir Introdução (TTS)
                      </button>
                    </div>

                    <div className="pt-6 border-t border-yellow-700/15 flex items-center gap-2 text-xs font-mono text-neutral-500">
                      <span>Edição Especial Autorizada</span>
                      <span>•</span>
                      <span>Proteção por Código Anti-Cópia Ativo</span>
                    </div>
                  </div>

                </div>
              )}

              {/* COPYRIGHT PAGE TYPE */}
              {currentPage.type === "copyright" && (
                <div className="space-y-6 max-w-3xl mx-auto py-4">
                  <div className="text-center">
                    <ShieldAlert className="text-yellow-500 mx-auto mb-3" size={32} />
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#d4af37]">
                      {currentPage.title}
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 uppercase font-mono">{currentPage.subtitle}</p>
                  </div>

                  <div className="space-y-4 max-w-xl mx-auto text-xs md:text-sm text-yellow-100/90 leading-relaxed pt-2">
                    {currentPage.paragraphs.map((p, idx) => {
                      if (p.includes("PROIBIDA") || p.includes("ESTRITAMENTE") || p.includes("CÓDIGO DE CONTROLE")) {
                        return (
                          <div key={idx} className="bg-red-950/15 border-l-4 border-red-600 p-3.5 rounded text-yellow-200 font-medium">
                            {p}
                          </div>
                        );
                      }
                      return <p key={idx} className="indent-4">{p}</p>;
                    })}
                  </div>

                  {/* Rendering Official CIP Catalog Block */}
                  <div className="pt-6">
                    {renderFichaCatalografica()}
                  </div>
                </div>
              )}

              {/* DEDICATION / PREFACE PAGE TYPE */}
              {(currentPage.type === "dedication" || currentPage.type === "preface") && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-4">
                  
                  {/* Optional Library illustration insert */}
                  {currentPage.image && (
                    <div className="md:col-span-5">
                      <div className="border-4 border-yellow-850/30 rounded-xl overflow-hidden shadow-lg transform rotate-1">
                        <img 
                          src={currentPage.image} 
                          alt={currentPage.imageAlt}
                          referrerPolicy="no-referrer"
                          className="w-full object-cover aspect-[4/3] md:aspect-auto" 
                        />
                        <div className="bg-yellow-950/40 p-2 text-center text-[10px] font-mono text-yellow-500">
                          {currentPage.imageAlt}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={currentPage.image ? "md:col-span-7 space-y-5" : "md:col-span-12 max-w-2xl mx-auto space-y-5"}>
                    <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-[#d4af37]">
                      {currentPage.title}
                    </h2>
                    
                    {currentPage.subtitle && (
                      <p className="text-sm font-mono tracking-widest text-yellow-500 uppercase">
                        {currentPage.subtitle}
                      </p>
                    )}

                    <div className="space-y-3.5 text-xs md:text-sm md:text-base leading-relaxed text-yellow-100/90 italic">
                      {currentPage.paragraphs.map((p, idx) => (
                        <p key={idx} className="indent-4">{p}</p>
                      ))}
                    </div>

                    {currentPage.quote && (
                      <div className="border-y border-yellow-700/20 py-4 my-6 text-center max-w-md mx-auto">
                        <p className="font-serif italic text-sm md:text-base text-yellow-400">
                          "{currentPage.quote}"
                        </p>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mt-2">
                          — {currentPage.quoteAuthor}
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* CONTENT PAGES TYPE */}
              {currentPage.type === "content" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-2">
                  
                  {/* Left Column (Illustration if available) */}
                  {currentPage.image && (
                    <div className="md:col-span-5 flex flex-col justify-start">
                      <div className="border-4 border-yellow-600/30 rounded-2xl overflow-hidden shadow-2xl relative group bg-neutral-950">
                        <img 
                          src={currentPage.image} 
                          alt={currentPage.imageAlt}
                          referrerPolicy="no-referrer"
                          className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-black/75 p-3 text-center border-t border-yellow-900/40 opacity-90 group-hover:opacity-100 transition-opacity">
                          <span className="font-sans font-medium text-[10px] text-yellow-300">
                            {currentPage.imageAlt}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Right Column (Text blocks and features) */}
                  <div className={currentPage.image ? "md:col-span-7 space-y-5" : "md:col-span-12 max-w-3xl mx-auto space-y-5"}>
                    
                    <h2 className="font-serif text-2xl md:text-3.5xl font-extrabold text-[#d4af37] leading-tight">
                      {currentPage.title}
                    </h2>
                    {currentPage.subtitle && (
                      <p className="text-xs font-mono uppercase tracking-widest text-yellow-600">
                        {currentPage.subtitle}
                      </p>
                    )}

                    {/* Prose with large Drop Cap (capitular) for 1st paragraph */}
                    <div className="space-y-4 text-xs md:text-sm md:text-base leading-relaxed text-yellow-500/10"></div>
                    <div className="space-y-4 text-[13px] md:text-[15px] leading-relaxed text-yellow-50/90 text-justify">
                      {currentPage.paragraphs.map((para, pIdx) => {
                        if (pIdx === 0 && para.length > 5) {
                          const firstChar = para.charAt(0);
                          const remainingText = para.slice(1);
                          return (
                            <p key={pIdx} className="indent-0">
                              <span className="float-left text-4xl md:text-5xl font-serif font-extrabold text-[#d4af37] mr-2 mt-1 line-height-none bg-[#d4af37]/10 px-2 rounded-lg border border-[#d4af37]/20">
                                {firstChar}
                              </span>
                              {remainingText}
                            </p>
                          );
                        }
                        return (
                          <p key={pIdx} className="indent-6">
                            {para}
                          </p>
                        );
                      })}
                    </div>

                    {/* Meta-Quotes inside prose content */}
                    {currentPage.quote && (
                      <div className="border-l-4 border-yellow-500 pl-4 py-1.5 my-4 bg-yellow-950/10 text-xs md:text-sm italic">
                        <p className="text-yellow-300">"{currentPage.quote}"</p>
                        <p className="text-[10px] font-mono uppercase text-neutral-500 mt-1">— {currentPage.quoteAuthor}</p>
                      </div>
                    )}

                    {/* Paragraph highlights of important pedagogical values */}
                    {currentPage.highlights && currentPage.highlights.length > 0 && (
                      <div className="mt-5 space-y-2">
                        {currentPage.highlights.map((highlight, hIdx) => {
                          const parts = highlight.split(":");
                          if (parts.length > 1) {
                            return (
                              <div key={hIdx} className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg text-xs flex mt-2 gap-3 items-start">
                                <Sparkles className="text-yellow-500 shrink-0 mt-0.5" size={16} />
                                <div>
                                  <span className="font-bold text-[#d4af37]">{parts[0]}: </span>
                                  <span className="text-yellow-100">{parts.slice(1).join(":")}</span>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div key={hIdx} className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg text-xs flex mt-2 gap-3 items-center text-yellow-100">
                              <Sparkles className="text-yellow-500 shrink-0" size={16} />
                              <span>{highlight}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Timeline steps block (Sleepy bird / Treasure map) */}
                    {currentPage.steps && currentPage.steps.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-yellow-700/10">
                        <span className="text-[11px] font-mono uppercase tracking-widest text-yellow-600 flex items-center gap-1.5 mb-4">
                          <Compass size={14} /> Passo a Passo da Lição Desenvolvida
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {currentPage.steps.map((step, sIdx) => (
                            <div 
                              key={sIdx}
                              className={`p-3.5 rounded-xl border transition-all hover:scale-[1.01] ${
                                theme === "dark" 
                                  ? "bg-neutral-800/50 border-neutral-700/50 hover:bg-neutral-800" 
                                  : "bg-stone-50 border-stone-200 hover:bg-stone-100"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-serif font-bold text-sm text-yellow-500">{step.title}</span>
                                <span className="font-mono text-[9px] bg-[#d4af37]/20 text-[#d4af37] px-1.5 py-0.5 rounded-full font-black">
                                  {step.number}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">{step.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}

              {/* SUMMARY PAGE TYPE (EPÍLOGO / SUPERPODERES) */}
              {currentPage.type === "summary" && (
                <div className="space-y-6">
                  <div className="text-center max-w-xl mx-auto space-y-2">
                    <Award className="text-yellow-500 mx-auto" size={36} />
                    <h2 className="font-serif text-2.5xl md:text-3.5xl font-extrabold text-[#d4af37]">
                      {currentPage.title}
                    </h2>
                    <p className="text-sm font-mono tracking-widest text-yellow-600 uppercase">{currentPage.subtitle}</p>
                    <p className="text-xs md:text-sm text-neutral-400 my-2">{currentPage.paragraphs[0]}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5 mt-6">
                    {currentPage.superpowers?.map((sp, idx) => (
                      <div 
                        key={idx}
                        className={`p-4.5 rounded-2xl border transition-all transform hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${
                          theme === "dark" 
                            ? "bg-neutral-900/80 border-neutral-800 hover:border-yellow-700/50" 
                            : "bg-[#faf8f4] border-stone-200 hover:border-yellow-600/30"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-2.5">
                            <span className="font-mono text-[10px] uppercase font-bold text-yellow-500">Superpoder #{sp.num}</span>
                            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-xs font-black text-yellow-500">
                              {sp.num}
                            </div>
                          </div>
                          
                          <h3 className="font-serif font-black text-sm text-yellow-100 mb-1.5">{sp.title}</h3>
                          <p className="text-[11px] text-neutral-400 leading-relaxed">{sp.desc}</p>
                        </div>

                        <div className="mt-3.5 pt-2.5 border-t border-neutral-800/50 flex items-center gap-1.5 text-[10px] text-yellow-500 font-mono">
                          <CheckCircle size={12} strokeWidth={3} /> Ativo no caráter
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-center text-neutral-500 italic mt-6">{currentPage.paragraphs[1]}</p>
                </div>
              )}

              {/* CONCLUSION PAGE TYPE (CONVÊNIO LANÇAMENTO & EMAIL CADASTRO/QUIZ) */}
              {currentPage.type === "conclusion" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch py-4">
                  
                  {/* Left Column: Vol 2 & Vol 3 conversions details */}
                  <div className="md:col-span-6 space-y-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-yellow-700/15 pb-6 md:pb-0 md:pr-6">
                    <div>
                      <div className="inline-flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded text-xs font-mono font-semibold mb-2">
                        <Sparkles size={14} /> Fim do Volume 1
                      </div>
                      
                      <h2 className="font-serif text-2xl md:text-3.5xl font-extrabold text-[#d4af37] leading-tight">
                        {currentPage.title}
                      </h2>
                      <p className="text-xs font-mono uppercase tracking-widest text-yellow-600 mt-1">
                        {currentPage.subtitle}
                      </p>

                      <div className="space-y-3.5 text-xs md:text-sm my-4 text-yellow-100/90 leading-relaxed text-justify">
                        <p>{currentPage.paragraphs[0]}</p>
                        <p>{currentPage.paragraphs[1]}</p>
                        <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/25 space-y-2 mt-4 text-xs">
                          <span className="font-bold text-yellow-500">{currentPage.paragraphs[2]}</span>
                          <p className="text-yellow-100/90 font-medium">{currentPage.paragraphs[3]}</p>
                          <p className="text-yellow-100/90 font-medium">{currentPage.paragraphs[4]}</p>
                        </div>
                        <p className="text-yellow-500 font-serif italic mt-4">{currentPage.paragraphs[5]}</p>
                      </div>
                    </div>

                    {/* Email lead capture - High Conversion */}
                    <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/10 p-4 rounded-xl border border-yellow-700/30 mt-4">
                      <div className="flex items-center gap-2 mb-2 text-xs font-mono text-yellow-500">
                        <Mail size={14} /> Receber Lançamento dos Volumes 2 e 3
                      </div>
                      <p className="text-[10px] text-neutral-400 mb-3">Preencha o e-mail de pais/educadores para baixar de graça quando os próximos volumes saírem!</p>
                      
                      {leadSubmitted ? (
                        <div className="bg-yellow-500/20 p-2.5 rounded text-xs text-yellow-400 font-bold flex items-center gap-2">
                          <Check size={16} /> E-mail cadastrado com sucesso! Enviaremos o Volume 2 em primeira mão.
                        </div>
                      ) : (
                        <form onSubmit={handleLeadSubmit} className="flex gap-2">
                          <input 
                            type="email" 
                            required
                            placeholder="educador@escola.com.br"
                            value={emailLead}
                            onChange={e => setEmailLead(e.target.value)}
                            className="bg-neutral-950/80 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white placeholder-neutral-500 flex-1 focus:ring-1 focus:ring-yellow-500 outline-none"
                          />
                          <button 
                            type="submit"
                            className="bg-yellow-500 hover:bg-yellow-600 text-neutral-950 text-xs font-bold px-3 py-1.5 rounded transition-all shrink-0"
                          >
                            Quero Receber!
                          </button>
                        </form>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Interaction knowledge test check game */}
                  <div className="md:col-span-6 flex flex-col justify-between pt-4 md:pt-0 pl-0 md:pl-2">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-[#d4af37] font-mono text-xs">
                        <HelpCircle size={16} /> Teste do Conhecimento (Infantil)
                      </div>
                      <h3 className="font-serif text-base font-bold text-yellow-100">
                        Será que você aprendeu com Toinho e Val?
                      </h3>
                      <p className="text-[10px] text-neutral-500">Responda às questões rápidas para receber seu selo.</p>

                      <form onSubmit={handleQuizSubmit} className="space-y-4 mt-4">
                        {quizQuestions.map((question) => (
                          <div key={question.id} className="space-y-1.5">
                            <p className="text-xs font-medium text-yellow-300">
                              {question.id}. {question.q}
                            </p>
                            <div className="space-y-1 text-xs">
                              {question.options.map((opt) => {
                                const isChecked = quizAnswers[question.id] === opt.value;
                                return (
                                  <label 
                                    key={opt.value} 
                                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                                      isChecked 
                                        ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-200" 
                                        : theme === "dark" 
                                          ? "bg-neutral-950/40 border-neutral-800/40 hover:bg-neutral-800/30 text-neutral-300"
                                          : "bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700"
                                    }`}
                                  >
                                    <input 
                                      type="radio" 
                                      name={`q-${question.id}`}
                                      value={opt.value}
                                      checked={isChecked}
                                      disabled={quizSubmitted}
                                      onChange={() => setQuizAnswers(prev => ({ ...prev, [question.id]: opt.value }))}
                                      className="mt-0.5 border-yellow-700 text-yellow-500 focus:ring-yellow-500 shrink-0"
                                    />
                                    <span>{opt.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {!quizSubmitted ? (
                          <button
                            type="submit"
                            disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                            className="w-full bg-[#d4af37] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-bold py-2 rounded text-xs transition-all tracking-wide"
                          >
                            Verificar Minhas Respostas!
                          </button>
                        ) : (
                          <div className="p-3.5 rounded-xl border border-yellow-600/30 bg-yellow-950/30 text-center space-y-2">
                            <span className="font-bold text-xs block text-yellow-400">
                              {quizScore === quizQuestions.length 
                                ? "⭐️ Perfeito! Nota 10! Você é um Leitor VIP!" 
                                : `Você acertou ${quizScore} de ${quizQuestions.length} questões! Muito bem!`}
                            </span>
                            
                            {quizScore === quizQuestions.length && (
                              <div className="text-[10px] text-yellow-100 bg-[#d4af37]/25 p-2 rounded mx-auto uppercase font-mono tracking-widest mt-1">
                                Selo concedido: Guardião Júnior do Saber
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={handleQuizReset}
                              className="text-[10px] font-mono text-yellow-500 flex items-center gap-1 mx-auto mt-2 hover:underline"
                            >
                              <RotateCcw size={12} /> Refazer Teste
                            </button>
                          </div>
                        )}
                      </form>

                    </div>
                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* READER BOTTOM PROGRESS & PAGE CHANGER */}
          <div className={`mt-8 pt-4 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${theme === "dark" ? "border-neutral-800" : "border-stone-200"}`}>
            
            {/* Left page switcher trigger */}
            <button
              id="prev_page_btn"
              onClick={handlePrevPage}
              disabled={currentPageIndex === 0}
              className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs transition-all ${
                currentPageIndex === 0
                  ? "opacity-40 cursor-not-allowed"
                  : theme === "dark" 
                    ? "border-neutral-700 hover:bg-neutral-800 text-yellow-500" 
                    : "border-stone-300 hover:bg-stone-100 text-yellow-800"
              }`}
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            {/* Pagination numbers ticker indicator */}
            <div className="flex items-center gap-1">
              {bookPages.map((_item, idx) => {
                const isCurrent = idx === currentPageIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentPageIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isCurrent 
                        ? "w-8 bg-yellow-500 shadow-md shadow-yellow-900/30" 
                        : `w-2.5 ${theme === "dark" ? "bg-neutral-800 hover:bg-neutral-700" : "bg-stone-300 hover:bg-stone-400"}`
                    }`}
                    title={`Página ${idx + 1}`}
                  />
                );
              })}
            </div>

            {/* Right page switcher trigger */}
            <button
              id="next_page_btn"
              onClick={handleNextPage}
              disabled={currentPageIndex === bookPages.length - 1}
              className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs transition-all ${
                currentPageIndex === bookPages.length - 1
                  ? "opacity-40 cursor-not-allowed"
                  : theme === "dark" 
                    ? "border-neutral-700 hover:bg-neutral-800 text-yellow-500" 
                    : "border-stone-300 hover:bg-stone-100 text-yellow-800"
              }`}
            >
              Próximo <ChevronRight size={16} />
            </button>
          </div>

        </main>
      </div>

      {/* FOOTER METADATA SECURITY DISCLAIMER */}
      <footer className={`py-4 px-6 border-t text-center text-[10px] font-mono leading-relaxed select-none ${
        theme === "dark" ? "bg-neutral-900/40 border-neutral-800 text-neutral-500" : "bg-[#f5f2eb] border-stone-200 text-stone-500"
      }`}>
        <p>© 2026 Toinho, o Amigo Leal e a Sabedoria de Val - Volume 1 (O Conhecimento é a Maior Aventura).</p>
        <p className="mt-0.5">Data de Criação: 15 de Dezembro de 2025 | Todos os direitos reservados. Código de Autenticação Anti-Cópia: <b>REG-BR-2026-TF82-VIP</b> em total conformidade com a Lei de Direitos Autorais do Brasil nº 9.610/98.</p>
      </footer>

    </div>
  );
}
