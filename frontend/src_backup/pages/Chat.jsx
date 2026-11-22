
import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/api";

import {
  Send,
  Sparkles,
  User,
  Zap,
  Clock,
  Database,
  Trash2,
  Cloud,
  Stars,
  Bot,
  ArrowUpRight,
  Brain,
  CircleDollarSign,
} from "lucide-react";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const query = input.trim();

    if (!query || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data = await sendMessage(query);

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
        metadata: {
          cacheHit: data.cache_hit,
          similarity: data.similarity,
          model: data.model_used,
          latency: data.latency_ms,
          cost: data.estimated_cost,
          complexity: data.complexity,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Something went wrong while connecting to SmartCache AI.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: errorMessage,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const clearConversation = () => {
    setMessages([]);
  };

  const suggestions = [
    {
      title: "What is semantic caching?",
      subtitle: "Understand SmartCache's core idea",
      icon: Database,
      color: "bg-emerald-100",
    },
    {
      title: "Explain machine learning",
      subtitle: "Explore a fascinating concept",
      icon: Brain,
      color: "bg-purple-100",
    },
    {
      title: "How does FAISS work?",
      subtitle: "Learn about vector similarity",
      icon: Sparkles,
      color: "bg-amber-100",
    },
    {
      title: "Compare BFS and DFS",
      subtitle: "A little algorithmic thinking",
      icon: ArrowUpRight,
      color: "bg-rose-100",
    },
  ];

  const formatNumber = (value, digits = 2) => {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(digits) : null;
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-2rem)] flex-col overflow-hidden bg-[#FFFDF6] text-[#28251F]">

      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-dashed border-[#D8D1C3] px-4 py-4 sm:px-6 md:px-8">

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-black bg-[#DDF4E7] shadow-[3px_3px_0px_#222] sm:h-12 sm:w-12">
            <Sparkles size={22} />
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl">
              SmartCache <span className="text-[#7A68B4]">AI ✦</span>
            </h1>
            <p className="text-xs text-[#777064] sm:text-sm">
              Your thoughtful little AI assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#B9DCC8] bg-[#EAF7EF] px-3 py-2 text-xs font-semibold text-[#326C4B] sm:text-sm">
          <Cloud size={15} />
          <span>Cloud-powered AI</span>
          <span className="h-2 w-2 rounded-full bg-green-500" />
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-3 py-5 sm:px-5 md:px-8 md:py-6">

        {messages.length === 0 ? (
          <div className="mx-auto flex min-h-full max-w-4xl flex-col items-center justify-center py-8 sm:py-12">

            {/* Welcome doodle */}
            <div className="relative mb-6">
              <div className="absolute -left-8 -top-4 rotate-[-15deg] text-3xl text-[#E8B95E]">
                ✦
              </div>

              <div className="absolute -right-8 top-1 rotate-[15deg] text-3xl text-[#C7A9E8]">
                ✿
              </div>

              <div className="flex h-20 w-20 rotate-[-4deg] items-center justify-center rounded-[25px] border-2 border-black bg-[#FFF0C7] shadow-[5px_5px_0px_#222] sm:h-24 sm:w-24 sm:rounded-[28px]">
                <Sparkles size={36} strokeWidth={1.8} />
              </div>
            </div>

            <span className="mb-3 rounded-full border border-[#DDD2BB] bg-[#F7F0E3] px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] text-[#8B7654] sm:px-4 sm:text-xs">
              A LITTLE AI, A LOT OF MAGIC
            </span>

            <h2 className="text-center text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              Hey there!
              <span className="mt-2 block font-normal text-[#8470B8]">
                What's on your mind?
              </span>
            </h2>

            <p className="mt-4 max-w-xl px-2 text-center text-sm leading-7 text-[#777064] sm:mt-5 sm:text-base md:text-lg">
              Ask me anything! I'll first check if I remember a similar
              question. If not, I'll find the right AI model to create
              a fresh answer.
            </p>

            {/* Architecture */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-[#D9D1EB] bg-[#F0EBFC] px-3 py-2 text-xs text-[#6E5A9F] sm:text-sm">
                <Database size={14} />
                Semantic Cache
              </div>

              <span className="text-[#B5AA98]">→</span>

              <div className="flex items-center gap-2 rounded-full border border-[#D5E6D7] bg-[#EAF5EC] px-3 py-2 text-xs text-[#4E7959] sm:text-sm">
                <Brain size={14} />
                Smart Routing
              </div>

              <span className="text-[#B5AA98]">→</span>

              <div className="flex items-center gap-2 rounded-full border border-[#F0D8B5] bg-[#FFF3DF] px-3 py-2 text-xs text-[#967044] sm:text-sm">
                <Cloud size={14} />
                Cloud LLM
              </div>
            </div>

            {/* Suggestions */}
            <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {suggestions.map((suggestion) => {
                const Icon = suggestion.icon;

                return (
                  <button
                    key={suggestion.title}
                    onClick={() => {
                      setInput(suggestion.title);
                      inputRef.current?.focus();
                    }}
                    className="group flex items-center gap-3 rounded-2xl border-2 border-[#29251F] bg-white p-3.5 text-left shadow-[3px_3px_0px_#29251F] transition-all hover:-translate-y-1 hover:shadow-[5px_5px_0px_#29251F] active:translate-y-0 active:shadow-[2px_2px_0px_#29251F] sm:gap-4 sm:p-4"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${suggestion.color} sm:h-12 sm:w-12`}
                    >
                      <Icon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold sm:text-base">
                        {suggestion.title}
                      </p>
                      <p className="mt-1 text-xs text-[#8A8275] sm:text-sm">
                        {suggestion.subtitle}
                      </p>
                    </div>

                    <ArrowUpRight
                      size={18}
                      className="shrink-0 text-[#AAA194] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-7 flex items-center gap-2 text-sm text-[#9B8F7D]">
              <Sparkles size={14} />
              <span>Take it easy. Ask away ♡</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-4xl flex-col gap-6 sm:gap-7">

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2.5 sm:gap-4 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-black shadow-[2px_2px_0px_#222] sm:h-10 sm:w-10 ${
                    message.role === "user"
                      ? "bg-[#E9E2FF]"
                      : "bg-[#DDF4E7]"
                  }`}
                >
                  {message.role === "user" ? (
                    <User size={17} />
                  ) : (
                    <Sparkles size={17} />
                  )}
                </div>

                {/* Message content */}
                <div
                  className={`flex min-w-0 max-w-[90%] flex-col sm:max-w-[85%] ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="mb-1.5 flex items-center gap-2 px-1">
                    <span className="text-xs font-bold sm:text-sm">
                      {message.role === "user" ? "You" : "SmartCache"}
                    </span>

                    {message.role === "assistant" && (
                      <span className="text-[10px] text-[#A49A89] sm:text-xs">
                        AI assistant
                      </span>
                    )}
                  </div>

                  <div
                    className={`whitespace-pre-wrap break-words rounded-2xl border-2 border-black px-3.5 py-3 text-sm leading-7 shadow-[3px_3px_0px_#222] sm:px-5 sm:py-3.5 sm:text-[15px] ${
                      message.role === "user"
                        ? "rounded-tr-sm bg-[#E9E2FF]"
                        : message.error
                        ? "rounded-tl-sm bg-[#FFE5E5] text-[#8D3535]"
                        : "rounded-tl-sm bg-white"
                    }`}
                  >
                    {message.content}
                  </div>

                  {/* Metadata */}
                  {message.metadata && (
                    <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">

                      {/* Cache */}
                      <span
                        className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold sm:px-2.5 sm:text-xs ${
                          message.metadata.cacheHit
                            ? "border-[#8DC9A4] bg-[#E3F5E9] text-[#33764B]"
                            : "border-[#E6BE83] bg-[#FFF1D9] text-[#92662B]"
                        }`}
                      >
                        <Database size={12} />
                        {message.metadata.cacheHit ? "CACHE HIT" : "CACHE MISS"}
                      </span>

                      {/* Similarity */}
                      {message.metadata.similarity != null && (
                        <span className="flex items-center gap-1 rounded-full border border-[#D9C9F3] bg-[#F1EAFE] px-2 py-1 text-[10px] text-[#71599E] sm:px-2.5 sm:text-xs">
                          <Sparkles size={12} />
                          {formatNumber(message.metadata.similarity * 100, 1)}%
                          similarity
                        </span>
                      )}

                      {/* Model */}
                      {message.metadata.model && (
                        <span className="flex max-w-full items-center gap-1 rounded-full border border-[#D8D4CC] bg-[#F4F1EB] px-2 py-1 text-[10px] text-[#625C52] sm:px-2.5 sm:text-xs">
                          <Bot size={12} />
                          <span className="break-all">
                            {message.metadata.model}
                          </span>
                        </span>
                      )}

                      {/* Latency */}
                      {message.metadata.latency != null && (
                        <span className="flex items-center gap-1 rounded-full border border-[#BFD9E9] bg-[#EAF5FC] px-2 py-1 text-[10px] text-[#48718A] sm:px-2.5 sm:text-xs">
                          <Clock size={12} />
                          {formatNumber(message.metadata.latency, 0)} ms
                        </span>
                      )}

                      {/* Cost */}
                      {message.metadata.cost != null && (
                        <span className="flex items-center gap-1 rounded-full border border-[#E7D3A6] bg-[#FFF7DE] px-2 py-1 text-[10px] text-[#8B713A] sm:px-2.5 sm:text-xs">
                          <CircleDollarSign size={12} />
                          ${formatNumber(message.metadata.cost, 6)}
                        </span>
                      )}

                      {/* Complexity */}
                      {message.metadata.complexity && (
                        <span className="flex items-center gap-1 rounded-full border border-[#D8D4CC] bg-[#F4F1EB] px-2 py-1 text-[10px] text-[#625C52] sm:px-2.5 sm:text-xs">
                          <Brain size={12} />
                          {message.metadata.complexity}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex gap-2.5 sm:gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#DDF4E7] shadow-[2px_2px_0px_#222] sm:h-10 sm:w-10">
                  <Sparkles size={17} />
                </div>

                <div className="flex min-w-0 flex-col items-start">
                  <div className="mb-1.5 px-1">
                    <span className="text-xs font-bold sm:text-sm">
                      SmartCache
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 rounded-2xl rounded-tl-sm border-2 border-black bg-white px-4 py-3.5 shadow-[3px_3px_0px_#222] sm:px-5 sm:py-4">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#8C78BE]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#8C78BE] [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#8C78BE] [animation-delay:300ms]" />
                    </div>

                    <span className="text-xs text-[#837969] sm:text-sm">
                      Finding the right model & brewing an answer...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Composer */}
      <footer className="border-t-2 border-dashed border-[#D8D1C3] bg-[#FFFDF6] px-3 pb-3 pt-3 sm:px-5 md:px-8 md:pt-4">

        <div className="mx-auto max-w-4xl">

          {/* Input */}
          <div className="flex items-end gap-2 rounded-2xl border-2 border-black bg-white p-2 pl-3 shadow-[3px_3px_0px_#222] transition-shadow focus-within:shadow-[4px_4px_0px_#8C78BE] sm:gap-3 sm:pl-4 sm:shadow-[4px_4px_0px_#222]">

            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your thoughts here..."
              rows={1}
              disabled={loading}
              className="max-h-40 min-h-[42px] flex-1 resize-none bg-transparent py-2.5 text-sm outline-none placeholder:text-[#AAA194] disabled:opacity-50 sm:text-[15px]"
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              title="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#DDF4E7] shadow-[2px_2px_0px_#222] transition-all hover:bg-[#C7E9D5] active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11"
            >
              <Send size={17} />
            </button>
          </div>

          {/* Input footer */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">

            <span className="flex items-center gap-1.5 text-[10px] text-[#928777] sm:text-xs">
              <Stars size={13} />
              Enter to send · Shift + Enter for a new line
            </span>

            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] text-[#948879] transition-colors hover:bg-[#F5E8E4] hover:text-[#B45353] sm:text-xs"
              >
                <Trash2 size={13} />
                Clear conversation
              </button>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-2 flex items-center justify-center gap-2 text-center text-[10px] text-[#A59A89] sm:mt-3 sm:text-xs">
            <Zap size={12} />
            <span>
              Similar questions may be answered instantly from semantic cache ♡
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Chat;
