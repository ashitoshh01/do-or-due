import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload as UploadIcon } from 'lucide-react';

const UploadModal = ({ task, onClose, onUpload }) => {
    const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'camera'
    const [cameraStream, setCameraStream] = useState(null);
    const [cameraError, setCameraError] = useState('');
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Cleanup camera stream on unmount
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    // ESC key to close
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const startCamera = async () => {
        try {
            setCameraError('');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Camera error:', error);
            if (error.name === 'NotAllowedError') {
                setCameraError('Camera permission denied. Please allow camera access and try again.');
            } else if (error.name === 'NotFoundError') {
                setCameraError('No camera found on this device.');
            } else {
                setCameraError('Failed to access camera. Please check your device settings.');
            }
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    setCapturedPhoto(blob);
                    stopCamera();
                }
            }, 'image/jpeg', 0.9);
        }
    };

    const retakePhoto = () => {
        setCapturedPhoto(null);
        startCamera();
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (50MB limit)
            const maxSize = 50 * 1024 * 1024; // 50MB in bytes
            if (file.size > maxSize) {
                alert(`File size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum allowed size is 50MB. Please choose a smaller file.`);
                return;
            }
            console.log(`File selected: ${file.name}, Size: ${(file.size / (1024 * 1024)).toFixed(2)}MB, Type: ${file.type}`);
            onUpload(file);
        }
    };

    const handleSubmitPhoto = () => {
        if (capturedPhoto) {
            const file = new File([capturedPhoto], `proof_${Date.now()}.jpg`, { type: 'image/jpeg' });
            onUpload(file);
        }
    };

    useEffect(() => {
        if (uploadMethod === 'camera' && !cameraStream && !capturedPhoto) {
            startCamera();
        } else if (uploadMethod === 'file') {
            stopCamera();
            setCapturedPhoto(null);
        }
    }, [uploadMethod]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content animate-in"
                style={{ maxWidth: '600px', padding: 0, overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: `1px solid hsl(var(--color-border-light))`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'hsl(var(--color-text-main))' }}>
                            Upload Proof
                        </h2>
                        <p style={{ fontSize: '14px', color: 'hsl(var(--color-text-secondary))', margin: 0 }}>
                            {task.objective}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={20} color="hsl(var(--color-text-secondary))" />
                    </button>
                </div>

                {/* Upload Method Tabs */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: `1px solid hsl(var(--color-border-light))`,
                    display: 'flex',
                    gap: '12px'
                }}>
                    <button
                        onClick={() => setUploadMethod('file')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: uploadMethod === 'file' ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-bg-input))',
                            color: uploadMethod === 'file' ? 'white' : 'hsl(var(--color-text-main))',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <UploadIcon size={18} />
                        Upload File
                    </button>
                    <button
                        onClick={() => setUploadMethod('camera')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: uploadMethod === 'camera' ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-bg-input))',
                            color: uploadMethod === 'camera' ? 'white' : 'hsl(var(--color-text-main))',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Camera size={18} />
                        Take Photo
                    </button>
                </div>

                {/* Content Area */}
                <div style={{ padding: '24px', minHeight: '200px' }}>
                    {uploadMethod === 'file' ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                border: `2px dashed hsl(var(--color-border))`,
                                borderRadius: '12px',
                                padding: '48px 24px',
                                background: 'hsl(var(--color-bg-input))',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = 'hsl(var(--color-text-main))';
                                    e.currentTarget.style.background = 'hsl(var(--color-border-light))';
                                }}
                                onDragLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'hsl(var(--color-border))';
                                    e.currentTarget.style.background = 'hsl(var(--color-bg-input))';
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = 'hsl(var(--color-border))';
                                    e.currentTarget.style.background = 'hsl(var(--color-bg-input))';
                                    const file = e.dataTransfer.files[0];
                                    if (file) {
                                        // Check file size (50MB limit)
                                        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
                                        if (file.size > maxSize) {
                                            alert(`File size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum allowed size is 50MB. Please choose a smaller file.`);
                                            return;
                                        }
                                        console.log(`File dropped: ${file.name}, Size: ${(file.size / (1024 * 1024)).toFixed(2)}MB, Type: ${file.type}`);
                                        onUpload(file);
                                    }
                                }}
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                <UploadIcon size={48} color="hsl(var(--color-text-secondary))" style={{ margin: '0 auto 16px' }} />
                                <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'hsl(var(--color-text-main))' }}>
                                    Click to upload or drag and drop
                                </p>
                                <p style={{ fontSize: '14px', color: 'hsl(var(--color-text-secondary))' }}>
                                    Images, PDF, DOC &amp; more (max 700KB)
                                </p>
                            </div>
                            <input
                                id="fileInput"
                                type="file"
                                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.zip,.rar,.7z"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </div>
                    ) : (
                        <div>
                            {cameraError ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '32px',
                                    background: '#FEF2F2',
                                    borderRadius: '12px',
                                    border: '1px solid #FEE2E2'
                                }}>
                                    <Camera size={48} color="#EF4444" style={{ margin: '0 auto 16px' }} />
                                    <p style={{ fontSize: '16px', fontWeight: 600, color: '#DC2626', marginBottom: '8px' }}>
                                        Camera Access Issue
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#991B1B', marginBottom: '16px' }}>
                                        {cameraError}
                                    </p>
                                    <button
                                        onClick={startCamera}
                                        className="btn btn-primary"
                                        style={{ padding: '10px 20px' }}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : capturedPhoto ? (
                                <div style={{ textAlign: 'center' }}>
                                    <img
                                        src={URL.createObjectURL(capturedPhoto)}
                                        alt="Captured"
                                        style={{
                                            width: '100%',
                                            maxHeight: '200px',
                                            objectFit: 'contain',
                                            borderRadius: '8px',
                                            marginBottom: '16px'
                                        }}
                                    />
                                    {/* Submit Button with Blinking Navy Blue */}
                                    <button
                                        onClick={handleSubmitPhoto}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: '#0F172A',
                                            color: 'white',
                                            fontSize: '16px',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            animation: 'blinkNavy 1.5s ease-in-out infinite',
                                            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.4)'
                                        }}
                                    >
                                        ✓ Submit as Proof
                                    </button>
                                    <button
                                        onClick={retakePhoto}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            marginTop: '10px',
                                            borderRadius: '8px',
                                            border: '2px solid hsl(var(--color-border))',
                                            background: 'transparent',
                                            color: 'hsl(var(--color-text-main))',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ↻ Retake Photo
                                    </button>

                                    {/* Blinking Animation */}
                                    <style>{`
                                        @keyframes blinkNavy {
                                            0%, 100% { 
                                                background: #0F172A;
                                                box-shadow: 0 4px 12px rgba(15, 23, 42, 0.4);
                                            }
                                            50% { 
                                                background: #1E293B;
                                                box-shadow: 0 4px 20px rgba(30, 41, 59, 0.6);
                                            }
                                        }
                                    `}</style>
                                </div>
                            ) : (
                                <div style={{
                                    position: 'relative',
                                    width: '100%'
                                }}>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        style={{
                                            width: '100%',
                                            height: '400px',
                                            borderRadius: '8px',
                                            background: '#000',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                                    {/* Circular Capture Button Overlay */}
                                    <button
                                        onClick={capturePhoto}
                                        style={{
                                            position: 'absolute',
                                            bottom: '100px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: '70px',
                                            height: '70px',
                                            borderRadius: '50%',
                                            background: 'white',
                                            border: '4px solid rgba(255, 255, 255, 0.3)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                            transition: 'all 0.2s',
                                            zIndex: 10
                                        }}
                                        onMouseDown={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(0.9)'}
                                        onMouseUp={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
                                    >
                                        <div style={{
                                            width: '54px',
                                            height: '54px',
                                            borderRadius: '50%',
                                            background: 'white',
                                            border: '2px solid #333'
                                        }} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
