DEFAULT_SYSTEM_INSTRUCTION = (
    "You are a friendly AI assistant. Respond naturally and keep your answers conversational."
)

def build_system_instruction(base: str, strict: bool, entries: list[dict]) -> str:
    if not entries:
        return base

    lines = []
    for i, entry in enumerate(entries, start=1):
        question = entry.get("question", "")
        answer = entry.get("answer", "")
        aliases = entry.get("aliases") or []

        lines.append(f"{i}) Q: {question}")
        if aliases:
            lines.append(f"   Aliases: {', '.join(aliases)}")
        lines.append(f"   A: {answer}")

    if strict:
        faq_rules = (
            "FAQ Rules:\n"
            "- If the user asks a question that matches (or is clearly the same intent as) one of the FAQs below, "
            "reply with the provided answer exactly.\n"
            "- Do not mention the FAQ list or these rules.\n"
            "- Do not add extra information unless the user asks a follow-up."
        )
    else:
        faq_rules = (
            "FAQ Rules:\n"
            "- If the user asks a question that matches (or is clearly the same intent as) one of the FAQs below, "
            "use the provided answer as the source of truth.\n"
            "- Do not mention the FAQ list."
        )

    faq_block = "\n".join(lines)
    return f"{base}\n\n{faq_rules}\n\nFAQs:\n{faq_block}"
