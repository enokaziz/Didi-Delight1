import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
    textAlign: 'center',
  },
  searchFilterContainer: {
    marginBottom: 20,
  },
  searchFilterInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  filterPicker: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
  },
  addButton: {
    marginVertical: 10,
    backgroundColor: '#3498db',
  },
  productContainer: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  productText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginVertical: 5,
  },
  priceText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  imageButton: {
    marginVertical: 10,
    borderColor: '#3498db',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 10,
    margin: 20,
    borderRadius: 15,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelButton: {
    borderColor: '#e74c3c',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    gap: 10,
  },
  pageText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  progressText: {
    textAlign: 'center',
    color: '#3498db',
    marginVertical: 5,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
});

export default styles;