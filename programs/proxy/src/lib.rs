use anchor_lang::prelude::*;
use cpipda::cpi::accounts::CreateUserSocials;
use cpipda::program::Cpipda;
use cpipda::{self, UserInfo};

declare_id!("HmbTLCmaGvZhKnn1Zfa1JVnp7vkMV4DYVxPLWBVoN65L");

#[program]
mod proxy {
    use super::*;
    pub fn update_socials(
        ctx: Context<SetSocials>,
        name: String,
        twitter: String,
        discord: String,
    ) -> Result<()> {
        println!("starting call to user socials");
        cpipda::cpi::create_user_socials(ctx.accounts.set_socials(), name, twitter, discord)
    }
}

#[derive(Accounts)]
pub struct SetSocials<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_socials: Account<'info, UserInfo>,
    pub cpipda_program: Program<'info, Cpipda>,
}

impl<'info> SetSocials<'info> {
    pub fn set_socials(&self) -> CpiContext<'_, '_, '_, 'info, CreateUserSocials<'info>> {
        let cpi_program = self.cpipda_program.to_account_info();
        let cpi_accounts = CreateUserSocials {
            user: self.user.to_account_info(),
            user_socials: self.user_socials.to_account_info(),
        };
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
