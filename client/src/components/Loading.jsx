import React from 'react'

const Loading = () => {
  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='animate-spin rounded-full h-18 w-18 border-2  border-t-primary'></div>
    </div>
  )
}

export default Loading
