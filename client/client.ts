import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

const MAX_NOTE_LEN = 500;
const NOTEBOOK_PROGRAM_ID = new PublicKey('');

async function writeNote(
  connection: Connection,
  payer: Keypair,
  noteAccount: PublicKey,
  owner: PublicKey,
  noteContent: string,
) {
  if (Buffer.from(noteContent).length > MAX_NOTE_LEN) {
    throw new Error('Note is too long.');
  }

  const instructionData = Buffer.from(noteContent);
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: noteAccount, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    programId: NOTEBOOK_PROGRAM_ID,
    data: instructionData,
  });

  const transaction = new Transaction().add(instruction);

  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer],
  );
  console.log(`Note written with transaction signature: ${signature}`);
}

(async () => {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const payer = Keypair.generate();
  const noteAccount = new PublicKey('');
  const owner = payer.publicKey;
  const noteContent = 'Hello world!';

  try {
    await writeNote(connection, payer, noteAccount, owner, noteContent);
  } catch (error) {
    console.error('Error writing note:', error);
  }
})();
