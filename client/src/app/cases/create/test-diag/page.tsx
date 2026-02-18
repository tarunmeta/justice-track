"use client";

export default function TestPage() {
    return (
        <div style={{ padding: '100px', backgroundColor: '#fff', minHeight: '100vh', position: 'relative', zIndex: 99999 }}>
            <h1 style={{ color: '#000' }}>ULTRA-MINIMAL TEST PAGE</h1>
            <p style={{ color: '#666' }}>Clicking the input below should NOT trigger a file picker.</p>

            <div style={{ marginTop: '20px' }}>
                <input
                    type="text"
                    placeholder="TYPE SOMETHING HERE"
                    style={{ padding: '10px', border: '2px solid red', width: '300px', color: '#000' }}
                    onClick={(e) => {
                        console.log('INPUT CLICKED');
                        e.stopPropagation();
                    }}
                />
            </div>

            <div style={{ marginTop: '50px' }}>
                <button
                    onClick={() => alert('Button Clicked')}
                    style={{ padding: '10px 20px', background: 'blue', color: 'white' }}
                >
                    Normal Button
                </button>
            </div>

            <div style={{ marginTop: '50px', fontSize: '12px', color: '#999' }}>
                If clicking the red input triggers a file picker, the issue is GLOBAL.
            </div>
        </div>
    );
}
