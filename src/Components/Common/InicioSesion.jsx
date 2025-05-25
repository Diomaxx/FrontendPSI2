import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {Link, useNavigate} from 'react-router-dom';
import {loginUser, saveToken, getUserCI, checkAndSaveAdminStatus} from '../../Services/authService.js';
import 'bootstrap/dist/css/bootstrap.min.css';

import Header from "./Header.jsx";


function InicioSesion() {
    const navigate = useNavigate();

    const initialValues = {
        cedulaIdentidad: '',
        contrasena: ''
    };

    const validationSchema = Yup.object({
        cedulaIdentidad: Yup.string().required('El C.I. es obligatorio'),
        contrasena: Yup.string().required('La contraseña es obligatoria')
    });

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            console.log('Form values:', values);
            const response = await loginUser(values);
            console.log('Login successful:', response);

            const token = response.token;
            const expiration = response.expiration;
            saveToken(token, expiration);
            
            // Get and log the CI extracted from the token
            const userCI = getUserCI();
            console.log('INICIO DE SESIÓN - CI del usuario:', userCI);
            
            // Check admin status and save it to localStorage
            try {
                const isAdmin = await checkAndSaveAdminStatus(userCI);
                console.log('Estado de administrador del usuario:', isAdmin);
            } catch (adminError) {
                console.error('Error al verificar estado de administrador:', adminError);
                // Continue with login even if admin check fails
            }
            
            navigate('/Donaciones');
        } catch (error) {
            setErrors({ contrasena: 'C.I. o contraseña incorrectos' });
        }
        setSubmitting(false);
    };

    return (
        <div className="big-div" >
            <Header />
            <div className="container-fluid d-flex flex-column align-items-center flex-grow-0 h-100 justify-content-center mt-3" >
                <div className="row p-4 m-5 shadow rounded flex-grow-1 shadow w-auto text-light " style={{ background:'rgba(1,1,1,0.19)',  maxWidth: '400px',width: '100%'}}>
                        <h3  className="text-center fw-semibold fs-3 mb-4 pb-0" style={{color:'#fdfdfd'}}>Iniciar Sesión</h3>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({isSubmitting}) => (
                                <Form>
                                    <div className="mb-3 mt-1">
                                        <label htmlFor="cedulaIdentidad" className="form-label">Carnet de Identidad
                                            (C.I.):</label>
                                        <Field type="text" name="cedulaIdentidad" className="form-control"
                                               placeholder="Ej. 1234567"/>
                                        <ErrorMessage name="cedulaIdentidad" component="div" className="text-light"/>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="contrasena" className="form-label">Contraseña:</label>
                                        <Field type="password" name="contrasena" className="form-control"/>
                                        <ErrorMessage name="contrasena" component="div" className="text-light"/>
                                    </div>
                                    <button type="submit" className="btn w-100 mt-1 rounded-pill btn-warning"
                                            style={{ color: 'black'}}
                                            disabled={isSubmitting}>
                                        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                                    </button>
                                    <p className="mt-1 mb-4 text-center ms-5 me-5"
                                       style={{color: 'grey', fontSize: 'smaller'}}>
                                        ¿No tienes una cuenta? <Link to="/registrate" style={{color: '#ffd833'}}>Regístrate
                                        aquí</Link>
                                    </p>
                                </Form>
                            )}
                        </Formik>
                    </div>
            </div>
        </div>
    );
}

export default InicioSesion;