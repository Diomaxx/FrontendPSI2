import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InicioSesion from "./Components/InicioSesion.jsx";
import Registro from "./Components/Registro.jsx";
import useTokenExpirationCheck from "./Components/useTokenExpirationCheck";
import HolaMundo from "./Components/HolaMundo.jsx";
import Donaciones from "./Components/Donaciones.jsx";
import FormularioSolicitud from "./Components/FormularioSolicitud.jsx";
import Seguimiento from "./Components/Seguimiento.jsx";
import ListarSolicitudes from "./Components/ListarSolicitudes.jsx";
import RutaProtegida from './Components/RutaProtegida.jsx';
import Metricas from "./Components/Metricas.jsx";

function TokenExpirationCheck() {
    useTokenExpirationCheck();
    return null;
}

function App() {
    return (
        <Router>
            <TokenExpirationCheck />
            <Routes>
                <Route path="/" element={<InicioSesion/>}/>
                <Route path="/login" element={<InicioSesion/>}/>
                <Route path="/registrate" element={<Registro/>}/>
                <Route path="/metricas" element={<RutaProtegida><Metricas/></RutaProtegida>}/>
                <Route path="/Seguimiento" element={<RutaProtegida><Seguimiento/></RutaProtegida>} />
                <Route path="/Solicitudes" element={<RutaProtegida><ListarSolicitudes/></RutaProtegida>} />
                <Route path="/Solicitar" element={<FormularioSolicitud/>} />
                <Route path="/Donaciones" element={<RutaProtegida><Donaciones/></RutaProtegida>} />

                <Route path="/HolaMundo" element={<HolaMundo/>}/>  {/* ARCHIVO TEMPORAL SOLO  PARA TESTEAR LOGIN*/}
            </Routes>
        </Router>
    );
}


export default App;