class AddVideoUrlToCandidates < ActiveRecord::Migration[8.0]
  def change
    add_column :candidates, :video_url, :string
  end
end
