import React from 'react';
import katex from 'katex';

export const Text = ({ children, variant = "p", style, latex, displayMode = false }) => {
    if (latex) {
        let html;
        try {
            html = katex.renderToString(latex, {
                throwOnError: false,
                displayMode,
            });
        } catch (err) {
            html = `<span style="color: red;">Invalid LaTeX</span>`;
        }

        return (
            <div
                style={style}
                className="latex-renderer"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    }

    const Component = variant;
    return <Component style={style}>{children}</Component>;
};