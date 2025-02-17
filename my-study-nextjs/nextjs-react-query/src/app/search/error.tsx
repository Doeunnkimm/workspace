'use client'

import { FC, useEffect } from 'react'

interface Props {
  error: Error
  reset: () => void
}

const Error: FC<Props> = ({ error, reset }) => {
  useEffect(() => {
    console.log(`Error: ${error}`)
  }, [error])

  return (
    <div className='flex flex-col justify-center items-center pt-10'>
      <h1 className='text-3xl mb-4'>Something went wrong</h1>
      <button
        className='text-blue-500'
        onClick={() => reset()}>
        Try again
      </button>
    </div>
  )
}

export default Error
