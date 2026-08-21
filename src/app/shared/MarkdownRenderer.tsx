import Markdown from 'react-markdown'
import type { Components } from 'react-markdown'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import oneLight from 'react-syntax-highlighter/dist/esm/styles/prism/one-light'
import remarkGfm from 'remark-gfm'
import './MarkdownRenderer.css'

SyntaxHighlighter.registerLanguage('typescript', typescript)

const ALLOWED_ELEMENTS = [
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'input',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
]

const markdownComponents: Components = {
  code: ({ className, children }) => {
    const languageMatch = /language-(\w+)/.exec(className ?? '')
    if (languageMatch) {
      return (
        <SyntaxHighlighter
          className="markdown-renderer__code-block"
          language={languageMatch[1]}
          style={oneLight}
          PreTag="div"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      )
    }
    return (
      <code className="markdown-renderer__code markdown-renderer__code--inline">
        {children}
      </code>
    )
  },
}

type MarkdownRendererProps = {
  content: string
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => (
  <div className="markdown-renderer">
    <Markdown
      remarkPlugins={[remarkGfm]}
      allowedElements={ALLOWED_ELEMENTS}
      unwrapDisallowed
      components={markdownComponents}
    >
      {content}
    </Markdown>
  </div>
)

export { MarkdownRenderer }
