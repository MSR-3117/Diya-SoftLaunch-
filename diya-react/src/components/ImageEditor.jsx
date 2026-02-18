import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric'; // Fabric 6 import style
import '../css/image-editor.css'; // We'll need some CSS
import { useBrand } from '../context/BrandContext';

export default function ImageEditor({ post, onClose, onSave }) {
    const canvasRef = useRef(null);
    const fabricCanvas = useRef(null);
    const containerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedObject, setSelectedObject] = useState(null);
    const { brandData, brandData: { fonts, colors } } = useBrand();

    // Initialize Canvas
    useEffect(() => {
        // Load Google Fonts
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        if (!canvasRef.current || fabricCanvas.current) return;

        console.log("Initializing Fabric Canvas...");
        // Dimensions will be set on load
        const canvas = new fabric.Canvas(canvasRef.current, {
            preserveObjectStacking: true,
            selection: true
        });
        fabricCanvas.current = canvas;

        canvas.on('selection:created', (e) => setSelectedObject(e.selected[0]));
        canvas.on('selection:updated', (e) => setSelectedObject(e.selected[0]));
        canvas.on('selection:cleared', () => setSelectedObject(null));

        // Load content
        loadPostContent(post);

        return () => {
            // Cleanup if needed
            canvas.dispose();
            fabricCanvas.current = null;
        }
    }, []);

    const loadPostContent = async (postData) => {
        setIsLoading(true);
        try {
            // Call Backend to generate/get layers
            const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/calendar/generate-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brand_data: brandData,
                    content: {
                        headline: postData.title,
                        body: postData.caption
                    },
                    platform: postData.platform
                })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.error);

            renderLayers(data);
        } catch (e) {
            console.error(e);
            alert("Failed to load editor: " + e.message);
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const renderLayers = async (data) => {
        const canvas = fabricCanvas.current;
        if (!canvas) return;

        const { layers, canvas: size, background } = data;

        // Resize canvas to fit screen (css scaling handled by container)
        // But we keep internal resolution high
        canvas.setDimensions({ width: size.width, height: size.height });

        // Handle Scaling for Viewer
        // We'll use CSS transform on the canvas-container
        const containerW = containerRef.current.clientWidth;
        const scale = Math.min(containerW / size.width, 0.8);
        canvas.setZoom(1); // Internal zoom 1

        // Set Background
        if (background) {
            try {
                const bgImg = await fabric.FabricImage.fromURL(background);
                canvas.backgroundImage = bgImg;

                // If using 'image' type background in layers, we can skip this or use it
                // Ideally, use layer[0] if it's the background image
            } catch (e) { console.warn("Bg load fail", e); }
        }

        // Add Objects
        // Fabric 6: fabric.util.enlivenObjects is often used for deserialization
        // But here we iterate manually for control
        for (const layer of layers) {
            if (layer.type === 'image' && layer.src.startsWith('data:')) {
                // Determine if it's bg or logo
                // If 'name' is 'overlay', 'logo' etc
                try {
                    const img = await fabric.FabricImage.fromURL(layer.src);
                    img.set({
                        left: layer.left, top: layer.top,
                        scaleX: layer.scaleX, scaleY: layer.scaleY,
                        originX: layer.originX, originY: layer.originY,
                        selectable: layer.selectable !== false
                    });
                    canvas.add(img);
                } catch (e) { }
            }
            else if (layer.type === 'text') {
                const text = new fabric.IText(layer.text, {
                    left: layer.left, top: layer.top,
                    fontSize: layer.fontSize,
                    fill: layer.fill,
                    fontFamily: layer.fontFamily,
                    fontWeight: layer.fontWeight,
                    textAlign: layer.textAlign,
                    originX: layer.originX, originY: layer.originY,
                    width: layer.width,
                    shadow: layer.shadow ? new fabric.Shadow(layer.shadow) : null,
                    selectable: true,
                    editable: true
                });
                canvas.add(text);
            }
            else if (layer.type === 'rect') {
                const rect = new fabric.Rect({
                    left: layer.left, top: layer.top,
                    width: layer.width, height: layer.height,
                    fill: layer.fill,
                    selectable: layer.selectable
                });
                canvas.add(rect);
            }
        }

        canvas.requestRenderAll();
        setIsLoading(false);
    };

    const handleDownload = () => {
        const dataURL = fabricCanvas.current.toDataURL({ format: 'png', quality: 0.9, multiplier: 1 });
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `diya-post-${post.id}.png`;
        link.click();
    };

    // UI Controls
    const updateProperty = (prop, value) => {
        const obj = fabricCanvas.current.getActiveObject();
        if (obj) {
            obj.set(prop, value);
            fabricCanvas.current.requestRenderAll();
        }
    };

    return (
        <div className="image-editor-overlay">
            <div className="editor-modal">
                <div className="editor-header">
                    <h3>Edit Post Visual</h3>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>

                <div className="editor-body">
                    <div className="canvas-wrapper" ref={containerRef}>
                        {isLoading && <div className="loader">Generating Layers...</div>}
                        <canvas ref={canvasRef} />
                    </div>

                    <div className="editor-tools">
                        {selectedObject && selectedObject.type === 'i-text' && (
                            <div className="tool-group">
                                <label>Text</label>
                                <input
                                    type="color"
                                    value={selectedObject.fill}
                                    onChange={(e) => updateProperty('fill', e.target.value)}
                                />
                                <select
                                    value={selectedObject.fontFamily}
                                    onChange={(e) => updateProperty('fontFamily', e.target.value)}
                                >
                                    <option value="Inter">Inter (Sans)</option>
                                    <option value="Playfair Display">Playfair (Serif)</option>
                                    <option value="Dancing Script">Script (Handwritten)</option>
                                    <option value="Helvetica">Helvetica</option>
                                    {/* Brand Fonts */}
                                    {fonts && fonts.map((f, i) => (
                                        <option key={i} value={f.family || f}>{f.family || f}</option>
                                    ))}
                                </select>
                                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                                    <button onClick={() => updateProperty('fontWeight', selectedObject.fontWeight === 'bold' ? 'normal' : 'bold')} style={{ padding: '5px 10px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}>Bold</button>
                                    <button onClick={() => updateProperty('fontStyle', selectedObject.fontStyle === 'italic' ? 'normal' : 'italic')} style={{ padding: '5px 10px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '12px' }}>Italic</button>
                                </div>
                            </div>
                        )}
                        {!selectedObject && <div className="hint">Select an element to edit</div>}

                        <div className="actions">
                            <button onClick={handleDownload} className="save-btn">Download Image</button>
                            <button onClick={() => {
                                const dataURL = fabricCanvas.current.toDataURL();
                                onSave(dataURL);
                            }} className="save-btn primary">Save to Post</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
