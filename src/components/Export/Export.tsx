import { useState, useRef, useEffect } from 'react';
import { useReactFlow, getNodesBounds, getViewportForBounds } from 'reactflow';
import jsPDF from 'jspdf';
import './Export.css';

interface ExportProps {
  className?: string;
}

export function Export({ className }: ExportProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [exporting, setExporting] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { getNodes } = useReactFlow();

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopover]);

  // Close popover with Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showPopover) {
        setShowPopover(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showPopover]);

  const exportToPNG = async () => {
    setExporting(true);
    try {
      const nodesBounds = getNodesBounds(getNodes());
      const viewport = getViewportForBounds(
        nodesBounds,
        nodesBounds.width,
        nodesBounds.height,
        0.5,
        2,
        0.1
      );

      // Find the react flow viewport element
      const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;
      if (!viewportElement) {
        console.error('Could not find React Flow viewport');
        return;
      }

      // Use html2canvas to capture the canvas
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(viewportElement, {
        backgroundColor: '#F5F0E8',
        scale: 2,
        logging: false,
      });

      // Download as PNG
      const link = document.createElement('a');
      link.download = `canvassy-board-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();

      setShowPopover(false);
    } catch (error) {
      console.error('Error exporting to PNG:', error);
      alert('Failed to export as PNG. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const nodesBounds = getNodesBounds(getNodes());

      // Find the react flow viewport element
      const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;
      if (!viewportElement) {
        console.error('Could not find React Flow viewport');
        return;
      }

      // Use html2canvas to capture the canvas
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(viewportElement, {
        backgroundColor: '#F5F0E8',
        scale: 2,
        logging: false,
      });

      // Calculate PDF dimensions to fit the content
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Create PDF with appropriate dimensions (in mm)
      const pdfWidth = 297; // A4 landscape width
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`canvassy-board-${Date.now()}.pdf`);

      setShowPopover(false);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export as PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={`export-container ${className || ''}`}>
      <button
        ref={buttonRef}
        className="export-button"
        onClick={() => setShowPopover(!showPopover)}
        title="Export Board"
        disabled={exporting}
      >
        {exporting ? '⏳' : '📥'}
      </button>

      {showPopover && (
        <div ref={popoverRef} className="export-popover">
          <div className="export-popover-header">
            <span className="export-popover-title">Export Board</span>
          </div>
          <div className="export-popover-options">
            <button
              className="export-option-button"
              onClick={exportToPNG}
              disabled={exporting}
            >
              <span className="export-option-icon">🖼️</span>
              <div className="export-option-text">
                <span className="export-option-label">PNG Image</span>
                <span className="export-option-description">High quality raster image</span>
              </div>
            </button>

            <button
              className="export-option-button"
              onClick={exportToPDF}
              disabled={exporting}
            >
              <span className="export-option-icon">📄</span>
              <div className="export-option-text">
                <span className="export-option-label">PDF Document</span>
                <span className="export-option-description">Portable document format</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
