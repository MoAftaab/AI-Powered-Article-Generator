import React from 'react';
import type { Tool } from '../../types/common'; // Assuming Tool type is defined

interface ToolbarProps {
  tools: Tool[];
}

const Toolbar: React.FC<ToolbarProps> = ({ tools }) => {
  return (
    <div style={{ display: 'flex', gap: '10px', padding: '10px', borderBottom: '1px solid #ccc' }}>
      {tools.map((tool) => (
        <button key={tool.id} onClick={tool.onClick} >
          {tool.label}
        </button>
      ))}
    </div>
  );
};

export default Toolbar;
