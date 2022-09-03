package gruppo1.grafofuncmanager.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfiguration implements WebSocketMessageBrokerConfigurer{
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Per usare ws://localhost:8080/stomp-endpoint :
        registry.addEndpoint("/stomp-endpoint").setAllowedOrigins("*"); //cambia da localhost:4200 a * per poter funzionare nel network docker
        
        // Per usare http://localhost:8080/stomp-endpoint :
        // registry.addEndpoint("/stomp-endpoint").setAllowedOrigins("http://localhost:4200").withSockJS();
        
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        // registry.setMessageSizeLimit(2048 * 2048);
        // registry.setSendBufferSizeLimit(2048 * 2048);
        registry.setMessageSizeLimit(200 * 1024 * 1024);
        registry.setSendBufferSizeLimit(200 * 1024 * 1024);
        registry.setSendTimeLimit(2048 * 2048);
    }
}
