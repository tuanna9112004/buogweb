import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className="prose prose-invert max-w-none prose-headings:font-heading prose-headings:uppercase prose-headings:tracking-wider prose-h1:text-3xl prose-h2:text-2xl prose-h2:text-[#b6ff2e] prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2 prose-h3:text-xl prose-p:text-[#a3a3a3] prose-p:leading-relaxed prose-li:text-[#a3a3a3] prose-strong:text-white prose-code:text-[#b6ff2e] prose-code:bg-[#111111] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
