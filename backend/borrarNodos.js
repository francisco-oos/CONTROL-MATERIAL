import fetch from 'node-fetch';  // Usar 'import' en vez de 'require'

async function borrarNodos() {
  try {
    const res = await fetch('http://localhost:3001/api/nodos/clear', {
      method: 'DELETE',
    });

    const data = await res.json();
    
    if (res.ok) {
      console.log('Respuesta del servidor:', data.message);
    } else {
      console.error('Error al eliminar nodos:', data);
    }
  } catch (error) {
    console.error('Error al hacer la solicitud:', error);
  }
}

borrarNodos();
