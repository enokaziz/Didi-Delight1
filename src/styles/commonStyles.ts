import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  messageContainer: {
    padding: 10,
    borderRadius: 18,
    marginVertical: 5,
    maxWidth: "85%",
  },
  clientMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
  },
  adminMessage: {
    backgroundColor: "#ECECEC",
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
  },
});