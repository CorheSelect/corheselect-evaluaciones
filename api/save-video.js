// API Endpoint para guardar videos en Airtable
export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { evaluationId, questionId, videoData, videoType } = req.body;

    // Validar datos
    if (!videoData || !videoType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Determinar el campo según el tipo
    const videoField = videoType === 'softskills' 
      ? 'Video respuesta soft skills' 
      : 'Video respuesta inglés';

    // Preparar datos para Airtable
    const airtableData = {
      fields: {
        [videoField]: videoData,
        'Número de intentos': 1
      }
    };

    // Opcionalmente agregar los links si se proporcionan
    if (evaluationId) {
      airtableData.fields['6. Resultados de evaluaciones por candidato 3'] = [evaluationId];
    }
    if (questionId) {
      airtableData.fields['Pregunta'] = [questionId];
    }

    // Guardar en Airtable
    const airtableResponse = await fetch(
      'https://api.airtable.com/v0/appvaNZdmHt24cHJV/tblILLpEJW4OxJugV',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer pat8oZQ31bhFCgtiu.1b614abc17a743d1438108fab30e7d7affc095b7d0f7269d0b03dfa77b502ac6',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(airtableData)
      }
    );

    if (!airtableResponse.ok) {
      const error = await airtableResponse.json();
      console.error('Airtable error:', error);
      return res.status(airtableResponse.status).json({ 
        error: 'Error saving to Airtable',
        details: error 
      });
    }

    const result = await airtableResponse.json();
    return res.status(200).json({ 
      success: true, 
      recordId: result.id 
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
