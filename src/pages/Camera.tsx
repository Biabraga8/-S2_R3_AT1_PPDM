import { useState, useEffect, useRef} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions, CameraType, CameraMode, } from 'expo-camera';
import { MaterialIcons } from "@expo/vector-icons"
import * as MediaLibrary from "expo-media-library"

//Define os modos de flash
type FlashMode = "off" | "on" | "auto";

export default function Camera() {
// permissoes do dispossitivo
// a expo fornece hooks que retornar statusAtual e funcao para solicitar

//Permissao de acesso a Camera
const [cameraPermission, requestCameraPermission] = useCameraPermissions();

//Permissao de acesso ao microfone
const [micPermission, requestMicPermission] = useMicrophonePermissions();

//Permissao para acessar e salvar arquivos na galeria
const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions({writeOnly:true});

//facing > controle se estamos usando a camera traseira ou frontal
const [facing, setFacing] = useState<CameraType>("back");

//cameraMode > alterna o modo foto ou gravar video
const[cameraMode, setCameraMode] = useState<CameraMode>("picture");

//isrecording > flag para saber se a gravacao de video está ativa no momento
const [isRecording, setIsRecording] = useState(false);

const [isSaving, setIsSaving] = useState(false);

//flashMode > armazena  status do flash 
const [flashMode, setFlashMode] =useState<FlashMode>("off");

// REFERENCIA DA CAMERA 
//useRef > cria a ligacao direta com o componente CameraView e nos permite atravez do .current
//cgamar os metodos nativos takePictureAstnc(), recordAsync() e stopReconding()
const cameraRef = useRef<CameraView>(null);

useEffect(() => {
  (async() => {
    if(!cameraPermission?.granted) await requestCameraPermission();
    if(!micPermission?.granted) await requestMicPermission();
    if(!mediaPermission?.granted) await requestMediaPermission();

  })();
}, [])

//Inverter entre camera front e trasseira
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  // Alterna ciclicamente o modo do flash: desligando > ligado > automatico > desligado
  const toggleFlashMode = () =>  {
    setFlashMode((current) => {
      if(current === "off") return "on"
      if(current === "on") return "auto"
      return "off"
    })
  }

  // Retorna o nome do icone 
  const getFlashIcon = () => {
    if(flashMode === "on") return "flash-on"
    if(flashMode === "auto") return "flash-auto"
    return "flash-off"
  }

  //Muda o modo camera (foto ou video)
  const handleCameraMode = (mode: CameraMode) => {
    setCameraMode(mode);

    if(isRecording) {
      setIsRecording(false);
      cameraRef.current?.stopRecording();
    }
  }

  const takeMedia = async () => {
    //se a refrencia da camera nao estiver pronta ou se ja estiver salvando algo, ignore o toque 
    if(!cameraRef.current || isSaving) return;
    
    try {
      if(cameraMode === "picture") {
        setIsSaving(true);

        const foto = await cameraRef.current.takePictureAsync({quality: 1, skipProcessing: false })

        if(foto?.uri) {
          let hasPermission = mediaPermission?.granted;

          if(!hasPermission) {
            const permissionResult = await requestMediaPermission();
            hasPermission = permissionResult.granted
          }

          if(!hasPermission) {
            Alert.alert("Aviso", "Permissao negada para salvar a foto na galeria.")

            setIsSaving(false);
            return;
          }

          await MediaLibrary.createAssetAsync(foto.uri);
          Alert.alert("Sucesso", "Foto salva na galeria")
        }
          setIsSaving(false);
        }else {
          // se ja estiver gravando, o novo clique do usuario serve para Para a gravacao
          if(isRecording) {
            cameraRef.current.stopRecording();
            return;
          }

          //se nao estiver gravando, inicia a gravacao
          setIsRecording(true);

          //a promise se recordAsync() so resolve quando stopRecording() for chamado
          const video = await cameraRef.current.recordAsync();
          setIsRecording(false)

          if(video?.uri) {
            await MediaLibrary.saveToLibraryAsync(video.uri)
            Alert.alert("Sucesso", "Video salvo na galeria!!")
          }
        }
    } catch (error) {
      setIsSaving(false);
      setIsRecording(false);
      Alert.alert("Erro", "Nao foi possivel capturar ou salvar a midia")
    }
  }

  //Redenrizacao Condicional
  if(!cameraPermission) {
    return <View style={styles.container}/>
  }

  //Caso o usuario tenha NEGADO acesso a camera
  if(!cameraPermission.granted) {
    return(
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.permissionText}>
          Precisamos de permissao para acessar a camera
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
          <Text style={styles.permissionButtonText}>Conceder Permisssao</Text>
        </TouchableOpacity>

      </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView 
      style={StyleSheet.absoluteFill} 
      ref={cameraRef} 
      facing={facing}
      flash={flashMode}
      mode={cameraMode}
      />

      <View style={styles.overlayContainer}>
        {/* Barra superiror = flash e inversao de camera */}
        <View style={styles.topContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleFlashMode}>
            <MaterialIcons name={getFlashIcon()} size={30} color="white"/>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
            <MaterialIcons name="cameraswitch" size={30} color="white"/>
          </TouchableOpacity>
        </View>
        {/* barra inferiror - selector de modo (foto/video) e botao de disparo */}
        <View style={styles.bottomContainer}>
            <View style={styles.controlsContainer}>
             <View style={styles.modeSelector}>
              <TouchableOpacity onPress={() => handleCameraMode("picture")}>
                <Text style={[styles.modeText, cameraMode === "picture" && styles.modeTextSelected]}>Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleCameraMode("video")}>
                <Text style={[styles.modeText, cameraMode === "video" && styles.modeTextSelected]}>Video</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.captureButton,
                isRecording && styles.captureButtonRecording,
              ]}
              onPress={takeMedia}
            >
              <View
                style={[
                  styles.captureInner,
                  isRecording && styles.captureInnerRecording,
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: "space-between", 
    backgroundColor: "transparent",
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 45, 
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.4)", 
    padding: 10,
    borderRadius: 25,
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingBottom: 40, 
  },
  controlsContainer: {
    alignItems: "center",
  },
  modeSelector: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modeText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "600",
  },
  modeTextSelected: {
    color: "white",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35, 
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonRecording: {
    backgroundColor: "rgba(255, 0, 0, 0.3)", 
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27, 
    backgroundColor: "white",
  },
  captureInnerRecording: {
    width: 30,
    height: 30,
    borderRadius: 8, 
    backgroundColor: "red",
  },
  permissionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
