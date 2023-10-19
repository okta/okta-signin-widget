import OpenAI from "openai";
import { readFile } from 'fs/promises';

async function readPropertiesFile() {
  try {
    const filePath = './src/login.properties';
    const data = await readFile(filePath, 'utf8');
    return data;
  } catch (err) {
    console.error(`Error reading the file: ${err}`);
    return '';
  }
}

const openai = new OpenAI({apiKey: 'api key'});

async function main() {
  const propertiesContent = await readPropertiesFile();
  // console.log(`properties:\n${propertiesContent}\n`);
  
  const prompt = 
  `I'll give you some properties, one on each line, in the format key=value. 

  Treat only value part as the sentence. Translate the sentences to Pikachu language.
  
  All words in the original sentence that are proper nouns, html tags, and digits should be preserved in the translation. 
  
  Any word in the original sentence that is not a proper nouns, or an html tag, or a digit should be translated to Pikachu language and not presented as English. 
  
  The translation need to have the exact same punctuations as the original sentence.
  
  Print out the translation, one on each line. 
  
  ${propertiesContent}`;

  console.log('prompt: ' + prompt)
  const stream = await openai.completions.create({
    model: "gpt-3.5-turbo-instruct-0914",
    prompt: `${prompt}`,
    stream: true,
  });

  let response = '';
  for await (const chunk of stream) {
    // console.log(chunk);
    response += chunk.choices[0].text
  }
  console.log(response);
}

main();
