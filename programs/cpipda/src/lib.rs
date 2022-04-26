use anchor_lang::prelude::*;

declare_id!("6UBeznVw8PWyhVPa9Sk99nMTR8C5GUt2k535ov4Pqvfg");

#[program]
pub mod cpipda {
    use super::*;
    pub fn set_user_socials(ctx: Context<UpdateUserSocials>) -> Result<()> {
        let user_socials = &mut ctx.accounts.user_socials;
        user_socials.name = "empty".to_string();
        user_socials.discord = "empty".to_string();
        user_socials.twitter = "empty".to_string();
        user_socials.bump = *ctx.bumps.get("user_socials").unwrap();
        Ok(())
    }
    pub fn create_user_socials(
        ctx: Context<CreateUserSocials>,
        name: String,
        twitter: String,
        discord: String,
    ) -> Result<()> {
        let user_socials = &mut ctx.accounts.user_socials;
        user_socials.name = name;
        user_socials.twitter = twitter;
        user_socials.discord = discord;
        Ok(())
    }
}

#[account]
pub struct UserInfo {
    pub twitter: String,
    pub name: String,
    pub discord: String,
    pub bump: u8,
}
#[derive(Accounts)]
pub struct UpdateUserSocials<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    // space: 8 discriminator + 2 level + 4 name length + 200 name + 1 bump
    #[account(
        init,
        payer = user,
        space = 8 + 2 + 4 + 600 + 1, seeds = [b"user-socials", user.key().as_ref()], bump
    )]
    pub user_socials: Account<'info, UserInfo>,
    pub system_program: Program<'info, System>,
}

// validation struct
#[derive(Accounts)]
pub struct CreateUserSocials<'info> {
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"user-socials", user.key().as_ref()], bump = user_socials.bump)]
    pub user_socials: Account<'info, UserInfo>,
}
