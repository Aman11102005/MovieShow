import { assets } from '../assets/assets'
import { CalendarIcon, ClockIcon, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'





const HeroSection = () => {
    const navigate = useNavigate()
    return (
        <div className='flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("/avengers-doomsday.jpg")] bg-cover bg-center h-screen'>
            <img src={assets.marvelLogo} alt="Marvel Logo" className="max-h-11 lg:h-11 mt-50" />
            <h1 className='text-4xl md:text-[70px] md:leading-17 font-semibold max-w-110'>Avengers :<br /> Doomsday</h1>

            <div className='flex items-center gap-4 text-gray-300'>
                <span> Action | Adventure | Sci-Fi</span>
                <div className='flex items-center gap-1'>
                    <CalendarIcon className='w-4.5 h-4.5' />2026
                </div>
                <div className='flex items-center gap-1'>
                    <ClockIcon className='w-4.5 h-4.5' />2h 30m
                </div>
            </div>
            <p className='max-w-xl text-gray-300'>
                After Thunderbolts, incursions threaten the multiverse. Shuri alerts Earth-616’s heroes. Avengers, Fantastic Four, New Avengers, X-Men unite to confront Doctor Doom across colliding realities.
            </p>
            <button onClick={() => navigate('/movies')} className='flex items-center gap-1 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>
                Explore movies
                <ArrowRight className="w-5 h-5"/>
            </button>

         

        </div >
    )
}

export default HeroSection


