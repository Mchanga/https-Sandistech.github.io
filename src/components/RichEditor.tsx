"use client";

import { useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading,
  Link as LinkIcon,
} from "lucide-react";

export default function RichEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function exec(command: string, arg?: string) {
    document.execCommand(command, false, arg);
    ref.current?.focus();
    onChange(ref.current?.innerHTML ?? "");
  }

  const tools = [
    { icon: <Heading className="h-4 w-4" />, cmd: () => exec("formatBlock", "<h3>"), label: "Heading" },
    { icon: <Bold className="h-4 w-4" />, cmd: () => exec("bold"), label: "Bold" },
    { icon: <Italic className="h-4 w-4" />, cmd: () => exec("italic"), label: "Italic" },
    { icon: <Underline className="h-4 w-4" />, cmd: () => exec("underline"), label: "Underline" },
    { icon: <List className="h-4 w-4" />, cmd: () => exec("insertUnorderedList"), label: "Bulleted list" },
    { icon: <ListOrdered className="h-4 w-4" />, cmd: () => exec("insertOrderedList"), label: "Numbered list" },
    { icon: <AlignLeft className="h-4 w-4" />, cmd: () => exec("justifyLeft"), label: "Align left" },
    { icon: <AlignCenter className="h-4 w-4" />, cmd: () => exec("justifyCenter"), label: "Align center" },
    { icon: <AlignRight className="h-4 w-4" />, cmd: () => exec("justifyRight"), label: "Align right" },
    {
      icon: <LinkIcon className="h-4 w-4" />,
      cmd: () => {
        const url = prompt("Enter URL");
        if (url) exec("createLink", url);
      },
      label: "Link",
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex flex-wrap gap-0.5 border-b bg-slate-50 p-1.5 dark:bg-slate-800/60">
        {tools.map((t, i) => (
          <button
            key={i}
            type="button"
            title={t.label}
            onClick={t.cmd}
            className="grid h-8 w-8 place-items-center rounded-md text-muted transition hover:bg-white hover:text-brand-600 dark:hover:bg-slate-700"
          >
            {t.icon}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
        className="prose-editor min-h-[220px] max-w-none p-3 text-sm leading-relaxed outline-none empty:before:text-muted empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
