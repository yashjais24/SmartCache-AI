
import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/api";

import {
  Send,
  Sparkles,
  User,
  Bot,
  Database,
  Clock,
  DollarSign,
  Loader2,
} from "lucide-react";

function ChatInput({
  input,
  setInput,
  handleSend,
  loading,
  textareaRef,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-end gap-3 rounded-2xl border-2 border-gray-900 bg-white p-2 shadow-[3px_3px_0px_#222]">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask SmartCache anything..."
          rows={1}
          className="max-h-36 min-h-[48px] flex-1 resize-y rounded-xl border-0 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-gray-400"
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-gray-900 bg-[#e6ddff] transition hover:bg-[#d6c9ff] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={19} />
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-gray-400">
        Enter to send · Shift + Enter for new line
      </p>
    </div>
  );
}

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (hasMessages) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, loading, hasMessages]);

  const handleSend = async () => {
    const query = input.trim();

    if (!query || loading) return;

    setInput("");
    setError("");

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await sendMessage(query);

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          response.response ||
          response.answer ||
          response.message ||
          "No response received.",
        metadata: {
          cache_hit: response.cache_hit,
          similarity: response.similarity,
          model_used: response.model_used,
          latency_ms: response.latency_ms,
          estimated_cost: response.estimated_cost,
          complexity: response.complexity,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Something went wrong. Please check your backend connection."
      );
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const formatLatency = (ms) => {
    if (ms == null) return "—";

    return ms < 1000
      ? `${Number(ms).toFixed(0)} ms`
      : `${(Number(ms) / 1000).toFixed(2)} s`;
  };

  const formatCost = (cost) => {
    if (cost == null) return "—";

    return `$${Number(cost).toFixed(6)}`;
  };

  const clearConversation = () => {
    setMessages([]);
    setError("");
    setInput("");

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={22} />

            <h1 className="font-['Patrick_Hand'] text-4xl font-bold">
              AI Chat
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Ask anything. SmartCache finds the smartest way to answer.
          </p>
        </div>

        {hasMessages && (
          <button
            onClick={clearConversation}
            className="self-start rounded-xl border-2 border-gray-900 bg-white px-4 py-2 text-sm font-bold shadow-[3px_3px_0px_#222] transition hover:translate-y-0.5 hover:shadow-none sm:self-auto"
          >
            New conversation
          </button>
        )}
      </div>

      {/* Empty state */}
      {!hasMessages && (
        <div className="flex flex-1 flex-col items-center justify-center px-2 pb-12">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-gray-900 bg-[#e6ddff] shadow-[4px_4px_0px_#222]">
            <Bot size={38} />
          </div>

          <h2 className="text-center font-['Patrick_Hand'] text-3xl font-bold sm:text-4xl">
            Hey! What can I help you with?
          </h2>

          <p className="mt-3 max-w-md text-center text-sm leading-6 text-gray-500">
            Your AI assistant is powered by semantic caching and
            intelligent model routing.
          </p>

          {/* Centered input */}
          <div className="mt-8 w-full max-w-3xl">
            <ChatInput
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              loading={loading}
              textareaRef={textareaRef}
            />
          </div>

          {error && (
            <div className="mt-4 w-full max-w-3xl rounded-xl border-2 border-red-400 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Active conversation */}
      {hasMessages && (
        <div className="flex min-h-[500px] flex-1 flex-col overflow-hidden rounded-2xl border-2 border-gray-900 bg-white shadow-[4px_4px_0px_#222]">
          {/* Messages area */}
          <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user"
                    ? "flex-row-reverse"
                    : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-gray-900 ${
                    message.role === "user"
                      ? "bg-[#fff0bd]"
                      : "bg-[#d9f3e3]"
                  }`}
                >
                  {message.role === "user" ? (
                    <User size={18} />
                  ) : (
                    <Bot size={18} />
                  )}
                </div>

                {/* Message */}
                <div
                  className={`min-w-0 max-w-[90%] sm:max-w-[80%] ${
                    message.role === "user"
                      ? "text-right"
                      : ""
                  }`}
                >
                  <div
                    className={`inline-block whitespace-pre-wrap break-words rounded-2xl border-2 border-gray-900 px-4 py-3 text-left text-sm leading-7 ${
                      message.role === "user"
                        ? "rounded-tr-sm bg-[#fff0bd]"
                        : "rounded-tl-sm bg-[#fffdf7]"
                    }`}
                  >
                    {message.content}
                  </div>

                  {/* Metadata */}
                  {message.role === "assistant" &&
                    message.metadata && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.metadata.cache_hit !==
                          undefined && (
                          <span
                            className={`flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs font-bold ${
                              message.metadata.cache_hit
                                ? "bg-[#d9f3e3] text-emerald-800"
                                : "bg-[#fff0bd] text-amber-800"
                            }`}
                          >
                            <Database size={12} />

                            {message.metadata.cache_hit
                              ? "Cache Hit"
                              : "Cache Miss"}
                          </span>
                        )}

                        {message.metadata.model_used && (
                          <span className="rounded-lg border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
                            🤖{" "}
                            {message.metadata.model_used.split("/").pop()}
                          </span>
                        )}

                        {message.metadata.latency_ms !==
                          undefined && (
                          <span className="flex items-center gap-1 rounded-lg border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
                            <Clock size={12} />

                            {formatLatency(
                              message.metadata.latency_ms
                            )}
                          </span>
                        )}

                        {message.metadata.estimated_cost !==
                          undefined && (
                          <span className="flex items-center gap-1 rounded-lg border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
                            <DollarSign size={12} />

                            {formatCost(
                              message.metadata.estimated_cost
                            )}
                          </span>
                        )}

                        {message.metadata.similarity !==
                          undefined &&
                          message.metadata.cache_hit && (
                            <span className="rounded-lg border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
                              Similarity:{" "}
                              {(
                                Number(
                                  message.metadata.similarity
                                ) * 100
                              ).toFixed(1)}
                              %
                            </span>
                          )}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-gray-900 bg-[#d9f3e3]">
                  <Bot size={18} />
                </div>

                <div className="rounded-2xl rounded-tl-sm border-2 border-gray-900 bg-[#fffdf7] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                    <span className="text-sm font-semibold text-gray-600">
                      SmartCache is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 mb-3 rounded-xl border-2 border-red-400 bg-red-50 p-3 text-sm font-semibold text-red-700 sm:mx-6">
              {error}
            </div>
          )}

          {/* Bottom input */}
          <div className="rounded-b-2xl border-t-2 border-gray-900 bg-[#fffdf7] p-4 sm:p-5">
            <ChatInput
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              loading={loading}
              textareaRef={textareaRef}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
