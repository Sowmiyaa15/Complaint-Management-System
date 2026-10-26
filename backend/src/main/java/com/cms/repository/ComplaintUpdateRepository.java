package com.cms.repository;

import com.cms.entity.Complaint;
import com.cms.entity.ComplaintUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintUpdateRepository extends JpaRepository<ComplaintUpdate, Long> {

    List<ComplaintUpdate> findByComplaintOrderByTimestampAsc(Complaint complaint);

    List<ComplaintUpdate> findByComplaintAndIsInternalFalseOrderByTimestampAsc(Complaint complaint);

    List<ComplaintUpdate> findByComplaintAndIsInternalTrueOrderByTimestampAsc(Complaint complaint);
}
