import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Camera, Loader, Bot, User } from 'lucide-react';

/**
 * TaskChatAssistant Component
 * 
 * A context-aware AI assistant scoped to a specific task.
 * Provides guidance without completing the task for the user.
 * 
 * Key Features:
 * - Task-specific context (title, description, deadline)
 * - Can accept image uploads for assignments
 * - Explains concepts, breaks down steps, clarifies doubts
 * - NEVER completes tasks directly
 * - Clean, minimal UI with dark/light mode support
 */

const TaskChatAssistant = ({ task, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ESC key listener to close chat
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    const handleSend = async () => {
        if (!inputMessage.trim() && !uploadedImage) return;

        const userMessage = {
            role: 'user',
            content: inputMessage,
            image: uploadedImage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setUploadedImage(null);
        setIsLoading(true);

        try {
            // Call AI service with strict prompt to ensure assistant doesn't solve the task
            const assistantResponse = await getAIResponse(task, [...messages, userMessage]);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: assistantResponse,
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'sticky',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
        }}>
            <div
                className="modal-content animate-in"
                style={{
                    maxWidth: '600px',
                    height: '80vh',
                    width: '90%',
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 10000
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid hsl(var(--color-border))',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'hsl(var(--color-bg-card))'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Bot size={20} color="white" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'hsl(var(--color-text-main))', margin: 0 }}>
                                Task Assistant
                            </h2>
                            <p style={{ fontSize: '12px', color: 'hsl(var(--color-text-secondary))', margin: 0 }}>
                                Your personal guide
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <X size={24} color="hsl(var(--color-text-secondary))" />
                    </button>
                </div>

                {/* Messages Container */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    background: 'hsl(var(--color-bg-app))'
                }}>
                    {messages.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: 'hsl(var(--color-text-secondary))'
                        }}>
                            <Bot size={48} color="hsl(var(--color-text-secondary))" style={{ opacity: 0.5, marginBottom: '16px' }} />
                            <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                                Start a conversation about your task:
                            </p>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: 'hsl(var(--color-text-main))' }}>
                                "{task.objective}"
                            </p>
                            <p style={{ fontSize: '12px', marginTop: '16px', opacity: 0.8 }}>
                                I'll guide you without giving away the answers!
                            </p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} style={{
                            marginBottom: '16px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'flex-start'
                        }}>
                            {msg.role === 'assistant' ? (
                                <>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <Bot size={16} color="white" />
                                    </div>
                                    <div style={{
                                        background: 'hsl(var(--color-bg-card))',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        maxWidth: '80%',
                                        border: '1px solid hsl(var(--color-border))',
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        color: 'hsl(var(--color-text-main))'
                                    }}>
                                        {msg.content}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div style={{ flex: 1 }} />
                                    <div style={{
                                        background: 'hsl(var(--color-text-main))',
                                        color: 'hsl(var(--color-bg-card))',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        maxWidth: '80%',
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '14px',
                                        lineHeight: '1.5'
                                    }}>
                                        {msg.image && (
                                            <img
                                                src={msg.image}
                                                alt="Uploaded"
                                                style={{
                                                    maxWidth: '100%',
                                                    borderRadius: '8px',
                                                    marginBottom: msg.content ? '8px' : '0'
                                                }}
                                            />
                                        )}
                                        {msg.content}
                                    </div>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'hsl(var(--color-bg-input))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <User size={16} color="hsl(var(--color-text-main))" />
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Bot size={16} color="white" />
                            </div>
                            <div style={{
                                background: 'hsl(var(--color-bg-card))',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '1px solid hsl(var(--color-border))'
                            }}>
                                <Loader size={16} color="hsl(var(--color-text-secondary))" className="spinning" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{
                    padding: '16px',
                    borderTop: '1px solid hsl(var(--color-border))',
                    background: 'hsl(var(--color-bg-card))'
                }}>
                    {uploadedImage && (
                        <div style={{ marginBottom: '12px', position: 'relative', display: 'inline-block' }}>
                            <img
                                src={uploadedImage}
                                alt="Preview"
                                style={{ maxWidth: '100px', borderRadius: '8px', border: '2px solid hsl(var(--color-border))' }}
                            />
                            <button
                                onClick={() => setUploadedImage(null)}
                                style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: '#EF4444',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: 'hsl(var(--color-bg-input))',
                                border: '1px solid hsl(var(--color-border))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                flexShrink: 0
                            }}
                        >
                            <Camera size={20} color="hsl(var(--color-text-secondary))" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                        />
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask for guidance... (I won't solve it for you!)"
                            className="input-field"
                            style={{
                                flex: 1,
                                minHeight: '40px',
                                maxHeight: '120px',
                                resize: 'none',
                                padding: '10px 12px'
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputMessage.trim() && !uploadedImage}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                background: (inputMessage.trim() || uploadedImage) ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-bg-input))',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: (inputMessage.trim() || uploadedImage) ? 'pointer' : 'not-allowed',
                                flexShrink: 0,
                                transition: 'all 0.2s'
                            }}
                        >
                            <Send size={18} color={(inputMessage.trim() || uploadedImage) ? 'white' : 'hsl(var(--color-text-secondary))'} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Spinning loader animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spinning {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

/**
 * AI Response Handler
 * 
 * This function calls the AI service with strict prompts to ensure:
 * 1. The assistant guides but doesn't solve
 * 2. Explanations are educational
 * 3. Task context is maintained
 */
async function getAIResponse(task, conversationHistory) {
    // System prompt with strict anti-cheating rules
    const systemPrompt = `You are a helpful task assistant designed to GUIDE users, NOT complete their work.

TASK CONTEXT:
- Title: ${task.objective}
${task.description ? `- Description: ${task.description}` : ''}
${task.deadline ? `- Deadline: ${new Date(task.deadline).toLocaleString()}` : ''}

CRITICAL RULES (DO NOT VIOLATE):
1. NEVER provide direct answers or solutions
2. NEVER complete assignments, homework, or work tasks
3. Instead: Ask probing questions, explain concepts, break down steps
4. If user uploads an assignment image: Explain concepts, don't solve problems
5. Be encouraging and supportive
6. Guide users to think critically

ALLOWED BEHAVIORS:
✅ Explain concepts and theory
✅ Break tasks into smaller steps
✅ Ask questions to help user think
✅ Suggest resources or approaches
✅ Review work and give feedback (without solving it)
✅ Help troubleshoot specific blockers

Example interactions:
- User: "What's the answer to problem 3?"
  You: "Great question! Let's think about this together. What approach have you tried so far? What do you think the first step should be?"
  
- User: *uploads math assignment*
  You: "I can see you have some algebra problems. Let's tackle them step by step. Which problem would you like to work on first? Tell me what you understand so far."

Remember: You're a guide, not a solution provider. Help them learn, don't do the work for them.`;

    // Format conversation history for AI
    const formattedHistory = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content + (msg.image ? ' [Image uploaded]' : '')
    }));

    // TODO: Replace with actual AI service call (Google AI, OpenAI, etc.)
    // For now, return a mock response that demonstrates the guiding behavior

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lastUserMessage = conversationHistory[conversationHistory.length - 1].content.toLowerCase();

    // Mock intelligent responses based on common patterns
    if (lastUserMessage.includes('answer') || lastUserMessage.includes('solution')) {
        return "I understand you're looking for help! However, instead of giving you the answer, let me guide you:\n\n1️⃣ What have you tried so far?\n2️⃣ Where exactly are you getting stuck?\n3️⃣ What's your current understanding of the problem?\n\nLet's work through this together - you'll learn much more by solving it yourself with my guidance! 💪";
    } else if (lastUserMessage.includes('how') || lastUserMessage.includes('what')) {
        return "Great question! 🤔\n\nLet me break this down for you:\n\n**Step 1**: Identify the key concepts involved\n**Step 2**: Think about what resources or knowledge you already have\n**Step 3**: Plan your approach\n\nWhat specific part would you like to explore first? Remember, I'm here to guide you, not give you the answer directly. The best learning happens when you work through it yourself!";
    } else if (conversationHistory[conversationHistory.length - 1].image) {
        return "I can see you've uploaded an image! 📸\n\nRather than solving this for you, let me help you understand it:\n\n✨ **My approach**:\n1. Look at the problem together\n2. Identify what concepts are being tested\n3. Break it into manageable pieces\n4. Guide you through the thinking process\n\nWhich specific part of this are you struggling with? What's your initial approach?";
    } else {
        return `I'm here to help you with "${task.objective}"! 🎯\n\nRemember, my role is to **guide** you, not complete the task for you. Here's how I can help:\n\n- 📚 Explain concepts you're unsure about\n- 🗺️ Help you plan your approach\n- 💡 Suggest strategies when you're stuck\n- ✅ Review your work and give feedback\n\nWhat would you like to focus on right now?`;
    }
}

export default TaskChatAssistant;
