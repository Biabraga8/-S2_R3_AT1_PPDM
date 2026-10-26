import React from "react";

// Stack Navigation
import { NavigationContainer } from "@react-navigation/native"; // Importa o componente NavigationContainer de "@react-navigation/native" para envolver a navegação da aplicação.
import { createNativeStackNavigator } from "@react-navigation/native-stack"; // Importa a função createNativeStackNavigator de "@react-navigation/native-stack" para criar um navegador de pilha nativo.

// Páginas
import Home from "./src/pages/Home"; // Importa o componente Home da pasta "./src/pages/Home".
import Camera from "./src/pages/Camera";
import Gps from "./src/pages/Gps";
import Acelerometro from "./src/pages/Acelerometro";

// Cria uma instância de um navegador de pilha usando createNativeStackNavigator e a armazena na constante Stack.
// Isso permite que você use esse navegador de pilha para definir a navegação em sua aplicação.
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer> 
      <Stack.Navigator initialRouteName="Home"> 
        <Stack.Screen name="Home" component={Home} /> 
        <Stack.Screen name="Camera" component={Camera} /> 
        <Stack.Screen name="Gps" component={Gps} />
        <Stack.Screen name="Acelerometro" component={Acelerometro} />
        </Stack.Navigator>
    </NavigationContainer>
  );
}
