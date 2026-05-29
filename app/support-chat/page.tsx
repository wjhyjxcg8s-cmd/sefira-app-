'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

export default function SupportChat() {
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.id) { setLoading(false); return }
      setUserId(session.user.id)
      const { data } = await supabase
        .from('admin_messages')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_global', false)
        .order('created_at', { ascending: true })
      if (data) setMessages(data)
      setLoading(false)
    }
    init()
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || !userId) return
    const text = input.trim()
    setInput('')
    const { data, error } = await supabase
      .from('admin_messages')
      .insert([{
        user_id: userId,
        title: 'reply',
        message: text,
        is_global: false,
        sender: 'user',
        is_read: false
      }])
      .select()
      .single()
    if (data) setMessages(prev => [...prev, data])
    if (error) alert('Error: ' + error.message)
  }

  if (loading) return <div style={{padding:'20px'}}>Loading...</div>
  if (!userId) return <div style={{padding:'20px'}}>Please login first</div>

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100vh',background:'#f0ebe4'}}>
      <div style={{padding:'16px',background:'#f97316',color:'white',fontWeight:'bold',fontSize:'18px'}}>
        Sefira Destek
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'8px'}}>
        {messages.length === 0 && <p style={{color:'#888',textAlign:'center'}}>Henüz mesaj yok</p>}
        {messages.map((msg) => (
          <div key={msg.id} style={{display:'flex',justifyContent:msg.sender==='user'?'flex-end':'flex-start'}}>
            <div style={{
              background:msg.sender==='user'?'#f97316':'white',
              color:msg.sender==='user'?'white':'black',
              padding:'10px 14px',borderRadius:'16px',maxWidth:'75%'
            }}>
              <div style={{fontSize:'11px',fontWeight:'bold',marginBottom:'4px',opacity:0.7}}>
                {msg.sender==='user'?'Siz':'Sefira Destek'}
              </div>
              {msg.message}
            </div>
          </div>
        ))}
      </div>
      <div style={{padding:'16px',display:'flex',gap:'8px',background:'white',borderTop:'1px solid #ddd'}}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key==='Enter' && sendMessage()}
          placeholder="Mesajınızı yazın..."
          style={{flex:1,padding:'12px',borderRadius:'24px',border:'1px solid #ddd',outline:'none'}}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          style={{padding:'12px 20px',background:'#f97316',color:'white',borderRadius:'24px',border:'none',cursor:'pointer',fontWeight:'bold'}}
        >
          Gönder
        </button>
      </div>
    </div>
  )
}
