function FloatingChatButton() {
  return (
    <button
      className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-3xl shadow-2xl transition hover:scale-110"
      aria-label="Open chat support"
    >
      💬
    </button>
  );
}

export default FloatingChatButton;