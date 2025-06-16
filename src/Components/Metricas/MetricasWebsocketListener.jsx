import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import { getMetricas } from "../../Services/metricasService.js"; // Import the metrics service


const MetricasWebSocketListener = ({ onActualizarMetricas }) => {
    useEffect(() => {
        const client = new Client({
            brokerURL: "wss://dasalas.shop:8443/ws",
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("Conectado a WebSocket para Métricas");

                client.subscribe("/topic/nueva-metrica", async () => {
                    console.log("Notificación de nuevas métricas recibida");

                    try {
                        
                        const nuevasMetricas = await getMetricas();
                        onActualizarMetricas(nuevasMetricas);
                    } catch (error) {
                        console.error("Error al actualizar métricas:", error);
                    }
                });
            },
            onStompError: (frame) => {
                console.error("STOMP Error:", frame);
            }
        });
        client.activate();

        return () => client.deactivate();
    }, [onActualizarMetricas]);
    return null;
};

export default MetricasWebSocketListener; 