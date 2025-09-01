import { LANGUAGE_CONFIG } from "@/app/(root)/_constants"
import {create} from 'zustand'
import * as monacoEditor from "monaco-editor"
import { CodeEditorState } from "@/types"

const getInitialState = ()=>{
    if(typeof window === "undefined"){
        return {
            language: "javascript",
            fontSize: 16,
            theme: "vs-dark"
        }
    }

    const savedLanguage = localStorage.getItem("editor-language") || "javascript";
    const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
    const savedFontSize = localStorage.getItem("editor-font-size") || 16;

    return {
        language: savedLanguage,
        theme: savedTheme,
        fontSize: Number(savedFontSize)
    }
}

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
    const initialSate = getInitialState();
    
    return {
        ...initialSate,
        output: "",
        isRunning: false,
        error: null,
        editor: null,
        executionResult: null,

        getCode: () => {
            const editor = get().editor as monacoEditor.editor.IStandaloneCodeEditor | null;
            
            if(editor && typeof editor.getValue === "function"){
                try {
                    return editor.getValue();
                } catch {
                    return "";
                }
            }
            return "";
        },

        setEditor: (editorInstance: monacoEditor.editor.IStandaloneCodeEditor | null) => {

            if(!editorInstance){
                set({ editor: null });
                return;
            }

            const savedCode = localStorage.getItem(`editor-code-${get().language}`)

            if(savedCode && typeof editorInstance.setValue === "function"){
                try {
                    editorInstance.setValue(savedCode)
                } catch (error) {
                    
                }   
            }
            
            set({ editor: editorInstance });
        },

        setTheme: (theme: string) => {
            localStorage.setItem(`editor-theme`, theme)
            set({ theme });
        },
        
        setFontSize: (fontSize: number) => {
            localStorage.setItem(`editor-font-size`, fontSize.toString())
            set({ fontSize });
        },

        setLanguage: (language: string) => {
            const editor = get().editor as monacoEditor.editor.IStandaloneCodeEditor | null;
            let currentCode="";
            if(editor && typeof editor.getValue === "function"){
                try {
                    currentCode = editor.getValue();
                } catch (error) {
                    currentCode="";
                }
            }

            if(!currentCode){
                localStorage.setItem(`editor-code-${get().language}`, currentCode);
            }

            localStorage.setItem("editor-language", language);

            set({
                language,
                output: "",
                error: null
            });
        },

        runCode: async () => {

        }
    };
});