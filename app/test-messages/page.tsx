'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

export default function TestMessages() {
  const [result, setResult] = useState('loading...')

  useEffect(() => {
    supabase
      .from('admin_messages')
      .select('*')
      .limit(5)
      .then(({ data, error }) => {
        setResult(JSON.stringify({
          count: data?.length,
          error: error?.message,
          first: data?.[0]?.title
        }, null, 2))
      })
  }, [])

  return <pre style={{padding:'20px'}}>{result}</pre>
}
