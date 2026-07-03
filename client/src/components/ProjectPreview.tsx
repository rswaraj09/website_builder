import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Project } from '../types';
import { iframeScript } from "../assets/assets";
import EditorPanel from "./EditorPanel";
import LoaderSteps from "./LoaderSteps";

interface ProjectPreviewProps {
  project: Project;
  isGenerating: boolean;
  device?: 'phone' | 'tablet' | 'desktop';
  showEditorPanel?: boolean;
}

export interface ProjectPreviewRef {
  getCode: () => string | undefined;
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(
  ({ project, isGenerating, device = 'desktop', showEditorPanel = true }, ref) => {

    const iframeRef= useRef<HTMLIFrameElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [selectedElement, setSelectedElement]=useState<any>(null)
    const [panelPos, setPanelPos] = useState<{left:number, top:number} | null>(null)
    const resolutions={
      phone:'w-[412px]',
      tablet:'w-[768px]',
      desktop:'w-full'
    }

    useImperativeHandle(ref, () => ({
  getCode: () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return undefined;

    // 1. Remove our selection class / attributes / outline from all elements
doc.querySelectorAll('.ai-selected-element,[data-ai-selected]').forEach((el)=>{
  el.classList.remove('ai-selected-element');
  el.removeAttribute('data-ai-selected');
  (el as HTMLElement).style.outline = '';
})

// 2. Remove injected style + script from the document
const previewStyle = doc.getElementById('ai-preview-style');
if(previewStyle) previewStyle.remove();

const previewScript = doc.getElementById('ai-preview-script');
if (previewScript) previewScript.remove()

// 3. Serialize clean HTML
const html = doc.documentElement.outerHTML;
return html;
  }
}))


    useEffect(()=>{
      const handleMessage = (event: MessageEvent) => {
        if (!event?.data) return;

        if (event.data.type === 'ELEMENT_SELECTED') {
          const payload = event.data.payload;
          setSelectedElement(payload);

          // compute panel position relative to container
          try {
            if (payload?.rect && iframeRef.current && containerRef.current) {
              const iframeRect = iframeRef.current.getBoundingClientRect();
              const containerRect = containerRef.current.getBoundingClientRect();
              const left = iframeRect.left - containerRect.left + (payload.rect.left || 0);
              const top = iframeRect.top - containerRect.top + (payload.rect.top || 0) + (payload.rect.height || 0);
              setPanelPos({ left, top });
            } else {
              setPanelPos(null);
            }
          } catch (e) {
            setPanelPos(null);
          }

        } else if (event.data.type === 'CLEAR_SELECTION') {
          setSelectedElement(null);
          setPanelPos(null);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    },[])

      const handleUpdate = (updates: any) => {
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            {
              type: 'UPDATE_ELEMENT',
              payload: updates
            },
            '*'
          );
        }
      }


    const injectPreview = (html: string) => {
                if (!html) return '';
                if (!showEditorPanel) return html;

                if (html.includes('</body>')) {
                    return html.replace('</body>', iframeScript + '</body>');
                } else {
                    return html + iframeScript;
                }
                };


    return(
       <div ref={containerRef} className='relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden max-sm:ml-2'>
          {project.current_code ? (
            <>
              <iframe
                ref={iframeRef}
                srcDoc={injectPreview(project.current_code)}
                className={`h-full max-sm:w-full ${resolutions[device]} mx-auto tranistion-all`}
              />
              {showEditorPanel && selectedElement && (
                <EditorPanel
                  selectedElement={selectedElement}
                  position={panelPos}
                  onUpdate={handleUpdate}
                  onClose={() => {
                    setSelectedElement(null);
                    setPanelPos(null);
                    if (iframeRef.current?.contentWindow) {
                      iframeRef.current.contentWindow.postMessage(
                        { type: 'CLEAR_SELECTION_REQUEST' },
                        '*'
                      );
                    }
                  }}
                />
              )}

            </>
          ) : (
            isGenerating && (
              <LoaderSteps/>
            )
          )}
        </div>

    )
}
)

export default ProjectPreview