import { Route,Routes, useLocation } from "react-router-dom"
import Home from "./pages/Home"

import Projects from "./pages/Projects"
import MyProjects from "./pages/MyProject"
import Preview from "./pages/Preview"
import Community from "./pages/Community"
import Navbar from './components/Navbar'
import AuthPage from "./pages/auth/AuthPage"
import Settings from "./pages/Settings"
import View from "./pages/View"

import { Toaster, toast } from 'sonner'

const App =()=>{

  const {pathname}=useLocation()

  const hideNavbar =
  pathname.startsWith('/projects/') && pathname !== '/projects' ||
  pathname.startsWith('/view/') ||
  pathname.startsWith('/preview/');

  return(
    <div>
    <Toaster/>
      {!hideNavbar&&<Navbar/>}
      
      <Routes>
        <Route path='/' element={<Home/>}/>

        <Route path='/projects/:projectId' element={<Projects/>}/>
        <Route path='/projects' element={<MyProjects/>}/>
        <Route path='/preview/:projectId' element={<Preview/>}/>
        <Route path='/preview/:projectId/:versionId' element={<Preview/>}/>
        <Route path='/community' element={<Community/>}/>
        <Route path='/view/:projectId' element={<View/>}/>
         <Route path="/auth/:pathname" element={<AuthPage />} />
         <Route path="/account/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}
export default App