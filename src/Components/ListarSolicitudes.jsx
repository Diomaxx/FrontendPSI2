import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import { getSolicitudesResumen, aprobarSolicitud, rechazarSolicitud } from "../Services/solicitudService.js";
import Header from "./Header.jsx";

// Helper function for date formatting
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

// Helper function for datetime formatting
const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const RequestCard = ({ request, onOpenModal, onShowDetails }) => {
    const getEstado = () => {
        if (request.aprobada === true) return "Aprobada";
        if (request.aprobada === false) return "Rechazada";
        return "Sin contestar";
    };

    const getEstadoColor = () => {
        if (request.aprobada === true) return "#28a745";
        if (request.aprobada === false) return "#dc3545";
        return "#6c757d";
    };

    return (
        <div className="glass-card p-3 mb-3 position-relative overflow-hidden"
             style={{
                 borderRadius: "16px",
                 height: "100%",
                 transition: "transform 0.3s ease, box-shadow 0.3s ease",
                 border: `1px solid rgba(255, 255, 255, 0.1)`,
                 boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
             }}>
            {/* Barra indicadora de estado */}
            <div className="position-absolute top-0 start-0 h-100"
                 style={{
                     width: "5px",
                     backgroundColor: getEstadoColor(),
                 }}></div>

            <div className="d-flex justify-content-between align-items-start">
                <h5 className="card-title fw-bold mb-3 text-white ps-3">{request.comunidad}</h5>
                <span className="badge"
                      style={{
                          backgroundColor: getEstadoColor(),
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "50px",
                          fontSize: "0.75rem",
                          fontWeight: "500"
                      }}>
                    {getEstado()}
                </span>
            </div>

            <div className="ps-3">
                <div className="mb-2 d-flex align-items-center">
                    <i className="bi bi-person-fill me-2 text-white"></i>
                    <p className="card-text mb-0 text-white">
                        <span className="text-light opacity-75">Solicitante:</span> {request.nombreSolicitante} {request.apellidoSolicitante}
                    </p>
                </div>

                <div className="mb-2 d-flex align-items-center">
                    <i className="bi bi-card-text me-2 text-white"></i>
                    <p className="card-text mb-0 text-white">
                        <span className="text-light opacity-75">CI:</span> {request.ciSolicitante}
                    </p>
                </div>

                <div className="mb-2 d-flex align-items-center">
                    <i className="bi bi-geo-alt-fill me-2 text-white"></i>
                    <p className="card-text mb-0 text-white text-truncate">
                        <span className="text-light opacity-75">Dirección:</span> {request.direccion}
                    </p>
                </div>

                <div className="mb-2 d-flex align-items-center">
                    <i className="bi bi-calendar-date me-2 text-white"></i>
                    <p className="card-text mb-0 text-white">
                        <span className="text-light opacity-75">Fecha:</span> {formatDate(request.fechaSolicitud)}
                    </p>
                </div>

                <div className="mt-3">
                    <h6 className="text-light fw-semibold">Productos solicitados:</h6>
                    <p className="text-white opacity-75 text-truncate">
                        {Array.isArray(request.listadoProductos) ? request.listadoProductos.join(', ') : request.listadoProductos}
                    </p>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                    <button
                        className="btn btn-link p-0 text-decoration-none text-info"
                        onClick={() => onShowDetails(request)}
                    >
                        <i className="bi bi-info-circle me-1"></i> Detalles
                    </button>

                    {request.aprobada === null && (
                        <div className="d-flex gap-2">
                            <button
                                className="btn btn-outline-light btn-sm px-3"
                                onClick={() => onOpenModal("rechazar", request)}
                            >
                                <i className="bi bi-x-circle me-1"></i> Rechazar
                            </button>
                            <button
                                className="btn btn-light btn-sm px-3 text-dark"
                                onClick={() => onOpenModal("aceptar", request)}
                            >
                                <i className="bi bi-check-circle me-1"></i> Aprobar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
const ListarSolicitudes = () => {
    const [dateFilter, setDateFilter] = useState("Recientes");
    const [estadoFilter, setEstadoFilter] = useState("Todas");
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [motivoRechazo, setMotivoRechazo] = useState("");

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailedSolicitud, setDetailedSolicitud] = useState(null);

    const handleShowDetails = (solicitud) => {
        setDetailedSolicitud(solicitud);
        setShowDetailModal(true);
    };

    useEffect(() => {
        const fetchSolicitudesData = async () => {
            try {
                setLoading(true);
                
                // Use the service function to get all solicitudes with a single API call
                const solicitudes = await getSolicitudesResumen();
                
                setRequests(solicitudes);
                setError(null);
                
            } catch (err) {
                console.error("Error al obtener solicitudes:", err);
                setError("Error al cargar las solicitudes. Intente nuevamente más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchSolicitudesData();
    }, []);

    const handleConfirmAction = async () => {
        if (!selectedSolicitud) return;
        try {
            if (modalAction === "aceptar") {
                await aprobarSolicitud(selectedSolicitud.idSolicitud);
            } else if (modalAction === "rechazar") {
                await rechazarSolicitud(selectedSolicitud.idSolicitud, motivoRechazo);
            }

            setRequests(prev => prev.map(req =>
                req.idSolicitud === selectedSolicitud.idSolicitud
                    ? { ...req, aprobada: modalAction === "aceptar" }
                    : req
            ));
        } catch (error) {
            console.error("Error al procesar la solicitud:", error);
        } finally {
            setShowModal(false);
        }
    };

    const onOpenModal = (action, solicitud) => {
        setSelectedSolicitud(solicitud);
        setModalAction(action);
        setMotivoRechazo("");
        setShowModal(true);
    };

    const filteredRequests = [...requests]
        .filter(req => {
            if (estadoFilter === "Aprobadas") return req.aprobada === true;
            if (estadoFilter === "Rechazadas") return req.aprobada === false;
            if (estadoFilter === "Sin contestar") return req.aprobada === null;
            return true; // "Todas"
        })
        .sort((a, b) => {
            return dateFilter === "Recientes"
                ? new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud)
                : new Date(a.fechaSolicitud) - new Date(b.fechaSolicitud);
        });


    return (
        <div className="list-div">
            <Header />
            <div className={showModal ? "blur-background flex-grow-1 m-1" : "flex-grow-1 m-1"}>
                <div className="container-fluid h-100 d-flex justify-content-center align-items-center">
                    <div className="w-100 w-md-75 h-100 p-2 m-1 m-md-3 rounded" style={{ maxWidth: '1200px', width: '100%' }}>
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: "70vh" }}>
                                <div className="text-center">
                                    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                    <p className="text-white mt-3">Cargando solicitudes...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger text-center" role="alert">
                                {error}
                            </div>
                        ) : (
                            <>
                                <div className="rounded pt-3 pb-3 ms-1 ms-md-3 me-1 me-md-3">
                                    <h3 className="text-center mt-2 mb-0 fs-3 text-white fw-semibold">Listado de Solicitudes</h3>
                                    <div className="d-flex flex-wrap justify-content-center gap-2 mt-4">
                                        <div className="btn-group">
                                            <button
                                                type="button"
                                                className={`btn ${dateFilter === "Recientes" ? "btn-mine" : "btn-outline-mine"}`}
                                                onClick={() => setDateFilter("Recientes")}
                                            >
                                                Recientes
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn ${dateFilter === "Antiguas" ? "btn-mine" : "btn-outline-mine"}`}
                                                onClick={() => setDateFilter("Antiguas")}
                                            >
                                                Antiguas
                                            </button>
                                        </div>

                                        <div className="btn-group ms-3">
                                            <button
                                                type="button"
                                                className={`btn ${estadoFilter === "Todas" ? "btn-mine" : "btn-outline-mine"}`}
                                                onClick={() => setEstadoFilter("Todas")}
                                            >
                                                Todas
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn ${estadoFilter === "Aprobadas" ? "btn-mine" : "btn-outline-mine"}`}
                                                onClick={() => setEstadoFilter("Aprobadas")}
                                            >
                                                Aprobadas
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn ${estadoFilter === "Rechazadas" ? "btn-mine" : "btn-outline-mine"}`}
                                                onClick={() => setEstadoFilter("Rechazadas")}
                                            >
                                                Rechazadas
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn ${estadoFilter === "Sin contestar" ? "btn-mine" : "btn-outline-mine"}`}
                                                onClick={() => setEstadoFilter("Sin contestar")}
                                            >
                                                Sin contestar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {filteredRequests.length > 0 ? (
                                    <div className="row g-3 justify-content-center p-1 p-md-3">
                                        {filteredRequests.map((request, index) => (
                                            <div key={index} className="col-12 col-md-6 col-lg-4">
                                                <RequestCard
                                                    request={request}
                                                    onOpenModal={onOpenModal}
                                                    onShowDetails={handleShowDetails}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center p-5">
                                        <p>No hay solicitudes disponibles con los filtros seleccionados</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

};

export default ListarSolicitudes;