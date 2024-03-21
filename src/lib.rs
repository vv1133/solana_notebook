use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

const MAX_NOTE_LEN: usize = 500; // 设定合约中的最大字符长度

#[derive(Debug)]
pub enum NotebookError {
    TooLongNote,
    NotAuthorized,
}
impl From<NotebookError> for ProgramError {
    fn from(e: NotebookError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    input: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;
    
    // 确保请求用户是该笔记的所有者
    let owner = next_account_info(accounts_iter)?;
    if account.owner != owner.key {
        msg!("You are not authorized to edit this note.");
        return Err(NotebookError::NotAuthorized.into());
    }

    // 更新笔记内容
    let data = &mut account.try_borrow_mut_data()?;
    if input.len() > MAX_NOTE_LEN {
        msg!("Note is too long.");
        return Err(NotebookError::TooLongNote.into());
    }

    // 清除现有信息并写入新内容
    for i in 0..data.len() {
        data[i] = 0;
    }
    data[..input.len()].copy_from_slice(input);
    Ok(())
}

solana_program::entrypoint!(process_instruction);

