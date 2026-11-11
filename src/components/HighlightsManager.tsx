import React from 'react';
import { HighlightEditor, HighlightEditorProps } from './HighlightEditor';

export interface HighlightsManagerProps extends HighlightEditorProps {}

export const HighlightsManager: React.FC<HighlightsManagerProps> = (props) => {
  return <HighlightEditor {...props} />;
};

export { HighlightEditor };
