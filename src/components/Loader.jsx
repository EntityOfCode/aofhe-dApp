
// src/components/Loader.tsx
import React, { useState, useEffect } from 'react'
import logoDark from '../assets/code Black s.svg'
import logoLight from '../assets/code white S.svg'

const Loader = () => {
    const [logo, setLogo] = useState(logoLight);

    useEffect(() => {
        // const prefersDarkScheme = window.matchMedia(
        //     '(prefers-color-scheme: dark)'
        // )
        // setLogo(prefersDarkScheme.matches ? logoLight : logoDark)

        // const handleChange = (event) => {
        //     setLogo(event.matches ? logoLight : logoDark)
        // }

        // prefersDarkScheme.addEventListener('change', handleChange)

        // return () => {
        //     prefersDarkScheme.removeEventListener('change', handleChange)
        // }
    }, [])

    // const logo = isDarkMode ? logoLight : logoDark

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="flex space-x-2">
                <div className="h-4 w-4 rounded-full bg-blue-500 animate-bounce"></div>
                <div className="h-4 w-4 rounded-full bg-blue-500 animate-bounce2"></div>
                <div className="h-4 w-4 rounded-full bg-blue-500 animate-bounce"></div>
            </div>
            <div className="mt-4 text-center">
                <div className="waving">
                    <img src={logo} alt="EOC" className="w-24 h-24" />
                    <p className="text-lg font-semibold text-gray-700">
                        FHE Processing...
                    </p>
                </div>
                <p className="text-sm text-gray-500">
                    Your data is on its way!
                </p>
            </div>
        </div>
    )
}

export default Loader
