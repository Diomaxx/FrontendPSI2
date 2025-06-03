import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import { getMetricas } from "../../Services/metricasService.js"; // Import the metrics service

/**
 * WebSocket listener component for Metricas
 * Subscribes to the metrics update channel and triggers refresh when new data arrives
 */
const MetricasWebSocketListener = ({ onActualizarMetricas }) => {
    useEffect(() => {
        const client = new Client({
            brokerURL: "wss://dasalas.shop:8443/ws",
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("Conectado a WebSocket para Métricas");

                // Subscribe to the metrics update topic
                client.subscribe("/topic/nueva-metrica", async () => {
                    console.log("Notificación de nuevas métricas recibida");

                    try {
                        // Fetch updated metrics data
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

        // Activate the client
        client.activate();

        // Clean up on unmount
        return () => client.deactivate();
    }, [onActualizarMetricas]);

    // This component doesn't render anything
    return null;
};

export default MetricasWebSocketListener; 