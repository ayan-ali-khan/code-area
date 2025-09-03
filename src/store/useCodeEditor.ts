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
            const { language, getCode } = get();
            const code = getCode();

            if(!code){
                set({error: "Please enter some code"})
                return
            }

            set({ isRunning: true, error: null, output: "" })

            try {
                const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
                const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        language: runtime.language,
                        version: runtime.version,
                        files: [{content:code}]
                    })
                })

                const data = await response.json();
                // console.log("data back from piston", data)

                //handle API level errors
                if(data.message){
                    set({error: data.message, executionResult: {code, output: "", error: data.message}})
                    return
                }

                //handle compilation error
                if(data.compile && data.compile.code !== 0){
                    const error = data.compile.error || data.compile.output;
                    set({
                        error,
                        executionResult: {
                            code, output: "", error
                        }
                    })
                    return
                }

                if(data.run && data.run.code !== 0){
                    const error = data.run.stderr || data.run.output;
                    set({
                        error,
                        executionResult: {
                            code, output: "", error
                        }
                    })
                    return
                }

                //if we get here, execution was successful
                const output = data.run.output;
                set({
                        output: output.trim(),
                        error: null,
                        executionResult: {
                            code,
                            output: output.trim(),
                            error: null,
                        },
                    });
            } catch (error) {
                console.log("Error running code", error)
                set({
                    error: "Error running code",
                    executionResult: {code, output: "", error: "Error running code"}
                });
            } finally {
                set({ isRunning: false });
            }
        }
    };
});

export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;