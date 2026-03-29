class CreateChatMessages < ActiveRecord::Migration[8.0]
  def change
    create_table :chat_messages do |t|
      t.text :body, null: false
      t.integer :user_id, null: false
      t.string :user_type, null: false  # 'User' or 'AdminUser'
      t.references :election, null: false, foreign_key: true

      t.timestamps
    end
    add_index :chat_messages, [:user_type, :user_id]
  end
end
