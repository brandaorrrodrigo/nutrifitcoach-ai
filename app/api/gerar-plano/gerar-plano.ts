import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { objetivo, peso, altura, idade, sexo, restricoes, nivelAtividade } = await request.json();

    console.log('🍽️ Gerando plano alimentar personalizado...');

    const OLLAMA_URL = 'http://localhost:11434';
    
    const prompt = `Você é um nutricionista experiente. Crie um plano alimentar DETALHADO e PERSONALIZADO para:

DADOS DO CLIENTE:
- Objetivo: ${objetivo}
- Peso: ${peso}kg
- Altura: ${altura}cm
- Idade: ${idade} anos
- Sexo: ${sexo}
- Restrições: ${restricoes || 'Nenhuma'}
- Nível de atividade: ${nivelAtividade}

INSTRUÇÕES:
1. Calcule o TMB (Taxa Metabólica Basal)
2. Calcule as calorias diárias necessárias
3. Defina os macros (proteína, carboidrato, gordura)
4. Crie um cardápio COMPLETO com:
   - Café da manhã (com quantidades em gramas)
   - Lanche da manhã
   - Almoço (com quantidades em gramas)
   - Lanche da tarde
   - Jantar (com quantidades em gramas)
   - Ceia (opcional)

FORMATO DA RESPOSTA (JSON):
{
  "calorias": 2000,
  "macros": {
    "proteina": 150,
    "carboidrato": 200,
    "gordura": 67
  },
  "refeicoes": {
    "cafeDaManha": {
      "horario": "07:00",
      "alimentos": [
        {"nome": "Ovos mexidos", "quantidade": "3 unidades", "calorias": 200},
        {"nome": "Pão integral", "quantidade": "2 fatias", "calorias": 140}
      ]
    },
    "lancheManha": {
      "horario": "10:00",
      "alimentos": [...]
    },
    "almoco": {
      "horario": "12:30",
      "alimentos": [...]
    },
    "lancheTarde": {
      "horario": "16:00",
      "alimentos": [...]
    },
    "jantar": {
      "horario": "19:30",
      "alimentos": [...]
    }
  },
  "observacoes": [
    "Beba pelo menos 2L de água por dia",
    "Ajuste as porções conforme sua fome"
  ]
}

RESPONDA APENAS COM O JSON, SEM TEXTO ADICIONAL.`;

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.1:8b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3, // Baixa temperatura para respostas mais consistentes
          num_predict: 2000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar plano');
    }

    const data = await response.json();
    console.log('✅ Plano gerado com sucesso');

    // Tentar parsear o JSON da resposta
    let plano;
    try {
      // Extrair JSON da resposta
      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plano = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', parseError);
      // Retornar um plano padrão caso falhe
      plano = {
        calorias: 2000,
        macros: { proteina: 150, carboidrato: 200, gordura: 67 },
        refeicoes: {
          cafeDaManha: {
            horario: "07:00",
            alimentos: [
              { nome: "Ovos mexidos", quantidade: "3 unidades", calorias: 200 },
              { nome: "Pão integral", quantidade: "2 fatias", calorias: 140 }
            ]
          }
        },
        observacoes: ["Plano básico gerado. Consulte um nutricionista para personalização."]
      };
    }
    
    return NextResponse.json({ plano });

  } catch (error: any) {
    console.error('❌ Erro ao gerar plano:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar plano alimentar. Tente novamente.' },
      { status: 500 }
    );
  }
}
