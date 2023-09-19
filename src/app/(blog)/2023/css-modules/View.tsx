import type { ReactNode } from 'react';
import { Fragment } from 'react';

interface ViewProps {
  id: string;
  caption: ReactNode;
  style: object;
}

export const View = ({ id, caption, style }: ViewProps) => {
  let lineCount = 0;
  return (
    <figure data-type="code">
      <span id={id} className="fragment-target" />
      <figcaption>{caption}</figcaption>
      <code className="hljs language-json">
        <LineNumber id={id} lineCount={++lineCount} />
        <span>
          <span>{'{'}</span>
        </span>
        {Object.entries(style).map(([key, value]) => {
          return (
            <Fragment key={key}>
              <LineNumber id={id} lineCount={++lineCount} />
              <span>
                {'  '}
                <span className="hljs-attr">{`"${key}"`}</span>
                <span className="hljs-punctuation">:</span>
                <span className="hljs-string">{`"${value}"`}</span>
              </span>
            </Fragment>
          );
        })}
        <LineNumber id={id} lineCount={++lineCount} />
        <span>
          <span>{'}'}</span>
        </span>
      </code>
      <a href={`#${id}`} className="fragment-ref" />
    </figure>
  );
};

interface LineNumberProps {
  id: string;
  lineCount: number;
}

const LineNumber = ({ id, lineCount }: LineNumberProps) => {
  const lineId = `${id}L${lineCount}`;
  return (
    <a href={`#${lineId}`} className="hljs-ln" draggable="false">
      <span id={lineId} className="fragment-target" />
      <span>{lineCount}</span>
    </a>
  );
};
