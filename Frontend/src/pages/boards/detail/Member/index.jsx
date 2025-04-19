import { useState } from "react";
import {
  Box,
  Paper,
  Grid,
  Container,
} from "@mui/material";
import { useParams } from "react-router-dom";

import Sidebar from "./Component/Siderbar";
import Header from "./Component/header";
import { Close } from "@mui/icons-material";
import MemberContent from "./Content/Member";
import GuestContent from "./Content/Guest";
import RequestContent from "./Content/Request";
import { useGetWorkspaceById } from "../../../../hooks/useWorkspace";

const Member = () => {

  const { workspaceId } = useParams();
  const { data: workspace } = useGetWorkspaceById(workspaceId);
  const [selectedItem, setSelectedItem] = useState('members');

  const handleSelect = (itemId) => {
    setSelectedItem(itemId);
  };

  console.log(workspace)

  return (
    <Container maxWidth="lg" sx={{ my: 2 }}>
      <Header workspace={workspace} />
      <Box sx={{ mb: 2, fontSize: '20px', fontWeight: 600 }}>
        Người Cộng Tác (2)
      </Box>
      <Grid container spacing={0}>
        <Grid item xs={10} md={3}>
          <Paper
            sx={{
              borderRadius: 1,
              overflow: 'hidden',
              height: '100%',
              boxShadow: 'none',
            }}
          >
            <Sidebar selectedItem={selectedItem} onSelect={handleSelect} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          {selectedItem === 'members' && (
            <MemberContent />
          )}

          {selectedItem === 'guests' && (
            <GuestContent />
          )}

          {selectedItem === 'requests' && (
            <RequestContent />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
export default Member;
