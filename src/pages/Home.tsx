import { StyleSheet, Text, View, Button, TouchableOpacity } from "react-native";
// Quando você utiliza useNavigation() em um componente, ele retorna a instância de navegação associada ao componente.
// Isso permite que você acesse métodos de navegação, como navigate, goBack, push, etc.
import { useNavigation } from "@react-navigation/native";


export default function Home() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.textContainer}>Tela Inicial</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate("Camera")}
        >
        <Text style={styles.textButton}>Ir para camera</Text>
        </TouchableOpacity>

        <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate("Gps")}
        >
        <Text style={styles.textButton}>Ir para o GPS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate("Acelerometro")}
        >
        <Text style={styles.textButton}>Ir para o acelerometro</Text>
        </TouchableOpacity>
       

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer : {
    fontSize: 25,
    marginBottom: 31,
    height: "20%",
  },

  button: {
    backgroundColor: "#4c42d499",
    borderRadius: 14,
    alignItems: "center",
    width: "70%",
    padding: 12, 
    marginBottom: 10,
  },
  textButton: {
    color: "#07076aff",
    fontSize: 20
  }
});
