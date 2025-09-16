import React, { useState, useRef, useCallback } from 'react';
import { Plus, Download, Settings, Eye, Save, X, MoreHorizontal, Search } from 'lucide-react';

const VisualSitemapBuilder = () => {
  const [nodes, setNodes] = useState([
    {
      id: '1',
      title: 'Page',
      description: 'Main landing page',
      type: 'main',
      x: 600,
      y: 100,
      parentId: null,
      children: ['2', '3', '4'],
      wireframe: {
        sections: [
          { type: 'header', color: '#10B981', label: 'Header' },
          { type: 'intro', color: '#3B82F6', label: 'Introduction' },
          { type: 'services', color: '#3B82F6', label: 'Services' },
          { type: 'news', color: '#3B82F6', label: 'Latest News' },
          { type: 'footer', color: '#8B5CF6', label: 'Footer' }
        ]
      }
    },
    {
      id: '2',
      title: 'Page',
      description: 'About page',
      type: 'page',
      x: 350,
      y: 350,
      parentId: '1',
      children: ['5']
    },
    {
      id: '3',
      title: 'Page',
      description: 'Services page',
      type: 'page',
      x: 600,
      y: 350,
      parentId: '1',
      children: ['6']
    },
    {
      id: '4',
      title: 'Page',
      description: 'Contact page',
      type: 'page',
      x: 850,
      y: 350,
      parentId: '1',
      children: []
    },
    {
      id: '5',
      title: 'Page',
      description: 'Sub page',
      type: 'page',
      x: 350,
      y: 500,
      parentId: '2',
      children: []
    },
    {
      id: '6',
      title: 'Page',
      description: 'Sub page',
      type: 'page',
      x: 600,
      y: 500,
      parentId: '3',
      children: []
    }
  ]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [dragData, setDragData] = useState({ isDragging: false, nodeId: null, offset: { x: 0, y: 0 } });
  const [showExportModal, setShowExportModal] = useState(false);
  const [sitemapVersion, setSitemapVersion] = useState('Sitemap ver.1');
  const canvasRef = useRef(null);

  const handleMouseDown = useCallback((e, nodeId) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    setDragData({ isDragging: true, nodeId, offset });
    setSelectedNode(nodeId);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!dragData.isDragging) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragData.offset.x;
    const newY = e.clientY - canvasRect.top - dragData.offset.y;

    setNodes(prev => prev.map(node => 
      node.id === dragData.nodeId 
        ? { ...node, x: Math.max(0, newX), y: Math.max(0, newY) }
        : node
    ));
  }, [dragData]);

  const handleMouseUp = useCallback(() => {
    setDragData({ isDragging: false, nodeId: null, offset: { x: 0, y: 0 } });
  }, []);

  const addNode = () => {
    const newNode = {
      id: Date.now().toString(),
      title: 'Page',
      description: 'New page description',
      type: 'page',
      x: 600,
      y: 400,
      parentId: selectedNode,
      children: []
    };

    setNodes(prev => {
      const updated = [...prev, newNode];
      if (selectedNode) {
        return updated.map(node => 
          node.id === selectedNode 
            ? { ...node, children: [...node.children, newNode.id] }
            : node
        );
      }
      return updated;
    });
  };

  const deleteNode = (nodeId) => {
    if (nodeId === '1') return;
    
    setNodes(prev => {
      const nodeToDelete = prev.find(n => n.id === nodeId);
      return prev
        .filter(node => node.id !== nodeId)
        .map(node => ({
          ...node,
          children: node.children.filter(childId => childId !== nodeId),
          parentId: node.parentId === nodeId ? nodeToDelete?.parentId || null : node.parentId
        }));
    });
    
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  const updateNode = (nodeId, updates) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  };

  const WireframeSection = ({ section, isLast }) => (
    <div className="relative">
      <div 
        className="w-full h-6 rounded flex items-center px-2 text-white text-xs font-medium"
        style={{ backgroundColor: section.color }}
      >
        {section.label}
      </div>
      {section.type === 'intro' && (
        <div className="mt-1 space-y-1">
          <div className="h-1 bg-blue-200 rounded w-full"></div>
          <div className="h-1 bg-blue-200 rounded w-4/5"></div>
          <div className="h-1 bg-blue-200 rounded w-3/5"></div>
        </div>
      )}
      {section.type === 'services' && (
        <div className="mt-1 flex gap-1">
          <div className="h-4 bg-blue-200 rounded flex-1"></div>
          <div className="h-4 bg-blue-200 rounded flex-1"></div>
        </div>
      )}
      {section.type === 'news' && (
        <div className="mt-1 space-y-1">
          <div className="flex gap-1">
            <div className="h-2 bg-blue-200 rounded flex-1"></div>
            <div className="h-2 bg-blue-200 rounded flex-1"></div>
          </div>
          <div className="h-1 bg-blue-200 rounded w-2/3"></div>
        </div>
      )}
      {section.type === 'footer' && (
        <div className="mt-1 flex justify-between">
          <div className="h-1 bg-purple-200 rounded w-4"></div>
          <div className="h-1 bg-purple-200 rounded w-4"></div>
          <div className="h-1 bg-purple-200 rounded w-4"></div>
        </div>
      )}
    </div>
  );

  const NodeComponent = ({ node }) => (
    <div
      className={`absolute bg-white rounded-xl shadow-lg border-2 cursor-move transition-all hover:shadow-xl ${
        selectedNode === node.id ? 'border-blue-400 ring-2 ring-blue-100' : 'border-blue-300'
      }`}
      style={{ left: node.x, top: node.y, width: '180px' }}
      onMouseDown={(e) => handleMouseDown(e, node.id)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditingNode(node.id);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="text-center mb-3">
          <div className="text-blue-500 font-medium text-sm">{node.title}</div>
        </div>

        {/* Wireframe sections for main page */}
        {node.type === 'main' && node.wireframe ? (
          <div className="space-y-2">
            {node.wireframe.sections.map((section, index) => (
              <WireframeSection 
                key={index} 
                section={section} 
                isLast={index === node.wireframe.sections.length - 1}
              />
            ))}
          </div>
        ) : (
          /* Simple page representation */
          <div className="space-y-2">
            <div className="h-8 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-xs text-gray-500">Content Area</div>
            </div>
          </div>
        )}
      </div>

      {/* Delete button for non-main pages */}
      {node.id !== '1' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(node.id);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-xs"
        >
          ×
        </button>
      )}
    </div>
  );

  const EditModal = ({ node, onClose, onSave }) => {
    const [editTitle, setEditTitle] = useState(node.title);
    const [editDescription, setEditDescription] = useState(node.description);
    const [editType, setEditType] = useState(node.type);

    const handleSave = () => {
      onSave({
        title: editTitle,
        description: editDescription,
        type: editType
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Edit Page</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Page Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full border rounded-md px-3 py-2 h-24"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Type</label>
            <select 
              value={editType} 
              onChange={(e) => setEditType(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="page">Page</option>
              <option value="main">Main Page</option>
              <option value="section">Section</option>
              <option value="category">Category</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <span className="text-blue-500 font-medium">Untitled project</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm uppercase tracking-wide">MAIN</span>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 overflow-hidden relative bg-gray-50">
        <div
          ref={canvasRef}
          className="w-full h-full relative overflow-auto"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: dragData.isDragging ? 'grabbing' : 'default' }}
        >
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {nodes.map(child => {
              const parent = nodes.find(n => n.id === child.parentId);
              return parent ? (
                <line
                  key={`${parent.id}-${child.id}`}
                  x1={parent.x + 90}
                  y1={parent.y + (parent.type === 'main' ? 200 : 80)}
                  x2={child.x + 90}
                  y2={child.y}
                  stroke="#60A5FA"
                  strokeWidth="2"
                />
              ) : null;
            })}
          </svg>

          {/* Nodes */}
          <div style={{ zIndex: 2, position: 'relative' }}>
            {nodes.map(node => (
              <NodeComponent key={node.id} node={node} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="bg-white border-t px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button className="text-gray-500 hover:text-gray-700">
                <span className="text-sm">{sitemapVersion}</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Bottom action buttons */}
            <button
              onClick={addNode}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus size={16} /> Add Page
            </button>
            
            <button className="px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100">
              <Search size={16} />
            </button>
            
            <button className="px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100">
              <Eye size={16} />
            </button>
            
            <button className="px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100">
              <Settings size={16} />
            </button>
            
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section Indicators */}
      <div className="absolute bottom-20 right-6 flex items-center gap-4">
        <span className="text-gray-400 text-sm uppercase tracking-wide">SECTION</span>
        <button className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">
          Explore SEO
        </button>
      </div>

      {/* Bottom Page Items */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
        <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <span className="text-blue-500 text-sm">Cookies</span>
          </div>
        </div>
        
        <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <span className="text-blue-500 text-sm">404 Error</span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingNode && (
        <EditModal
          node={nodes.find(n => n.id === editingNode)}
          onClose={() => setEditingNode(null)}
          onSave={(updates) => {
            updateNode(editingNode, updates);
            setEditingNode(null);
          }}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Export Sitemap</h2>
            <p className="text-gray-600 mb-4">
              Export your sitemap as JSON file with {nodes.length} pages.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const exportData = { sitemap: nodes, exportDate: new Date().toISOString() };
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'sitemap-export.json';
                  a.click();
                  URL.revokeObjectURL(url);
                  setShowExportModal(false);
                }}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Download JSON
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualSitemapBuilder;