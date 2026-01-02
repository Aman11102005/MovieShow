import React from 'react'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { SearchIcon, MenuIcon, TicketPlus } from 'lucide-react'
import { XIcon } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { useAppContext } from '../context/AppContext'




const Navbar = () => {

  const { favoriteMovies } = useAppContext()

  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const navigate = useNavigate()
  const [activeLink, setActiveLink] = useState('/')
  const location = useLocation()

  // Update activeLink based on route changes
  React.useEffect(() => {
    // Listen for route changes and update activeLink accordingly
    setActiveLink(location.pathname)
  }, [location.pathname])

  return (
    <div className='fixed top-0 left-0 z-50 w-full flex items-center
    justify-between px-6 md:px-16 lg:px-36 py-5 font-semibold'>

      <Link to='/' className='max-md:flex-1'>
        <img src={assets.logo} alt="" className='w-36 h-auto' />
      </Link>

      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium
           z-50 flex flex-col md:flex-row items-center max-md:text-lg max-md:justify-center gap-8 min-md:px-8 py-3 max-md:h-screen min-md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-[width] duration-300
            ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}`}>

        <XIcon className='md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer' onClick={() => setIsOpen(!isOpen)} />

        {[
          { to: '/', label: 'Home' },
          { to: '/movies', label: 'Movies' },
          { to: '/tailers', label: 'Tailers' }
        ].map(link => (
          <Link
            key={link.to}
            className="relative transition-all duration-300"
            onClick={() => { scrollTo(0, 0); setIsOpen(false); }}
            to={link.to}
          >
            {link.label}
            <span
              className={`absolute left-0 -bottom-1 h-[2px] bg-white transition-all duration-300
                ${activeLink === link.to ? 'w-full' : 'w-0'}`}
              style={{ borderRadius: '2px' }}
            />
          </Link>
        ))}
        {/* <Link onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/'>Releases</Link> */}
        {favoriteMovies.length > 0 && (
          <Link
            className="relative transition-all duration-300"
            onClick={() => { scrollTo(0, 0); setIsOpen(false); }}
            to='/favorite'
          >
            Favorites
            <span
              className={`absolute left-0 -bottom-1 h-[2px] bg-white transition-all duration-300
                ${activeLink === '/favorite' ? 'w-full' : 'w-0'}`}
              style={{ borderRadius: '2px' }}
            />
          </Link>
        )}
      </div>

      <div className='flex items-center gap-8'>
        <SearchIcon className='max-md:hidden w-6 h-6 cursor-pointer' />
        {
          !user ? (
            <button onClick={openSignIn} className='px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'> Login</button>
          ) : (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action label="My Bookings" labelIcon={<TicketPlus width={15} />} onClick={() => navigate('/my-bookings')} />
              </UserButton.MenuItems>
            </UserButton>
          )
        }
      </div>
      <MenuIcon className='max-md:ml-4 md:hidden w-8 h-8 cursor-pointer' onClick={() => setIsOpen(!isOpen)} />
    </div >
  )
}

export default Navbar
